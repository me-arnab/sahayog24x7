const Complaint = require("../models/Complaint");
const WorkReport = require("../models/WorkReport");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

exports.submitReport = async (req, res) => {
  try {
    const { complaintId, workPerformed, conditionAfter } = req.body;
    const afterPhoto = req.file ? `/uploads/${req.file.filename}` : null;

    if (!complaintId || !workPerformed || !conditionAfter) {
      return res.status(400).json({
        message: "complaintId, workPerformed, and conditionAfter are required",
      });
    }

    if (!afterPhoto) {
      return res.status(400).json({ message: "After photo is required" });
    }

    const complaintQuery = mongoose.Types.ObjectId.isValid(complaintId)
      ? { _id: complaintId }
      : { complaintId };

    const complaint = await Complaint.findOne(complaintQuery);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.assignedWorker.toString() !== req.worker._id.toString()) {
      return res
        .status(403)
        .json({ message: "This complaint is not assigned to you" });
    }


    if (complaint.status !== "IN_PROGRESS") {
      return res.status(400).json({
        message: `Cannot submit report. Current status: ${complaint.status}. Must be IN_PROGRESS.`,
      });
    }

    const workReport = await WorkReport.create({
      complaintId,
      workerId: req.worker._id,
      afterPhoto,
      workPerformed,
      conditionAfter,
      status: "pending",
    });

    complaint.status = "PENDING_APPROVAL";
    complaint.endTime = new Date();
    complaint.timeTakenInSeconds = Math.floor(
      (complaint.endTime - complaint.startTime) / 1000
    );
    await complaint.save();

    res.status(201).json({
      message: "Work report submitted successfully",
      workReport,
      complaint,
    });
  } catch (error) {
    console.error("Submit report error:", error);

    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }

    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const reports = await WorkReport.find({})
      .populate("complaintId", "complaintId issueType consumerName description emergency location address status")
      .populate("workerId", "name phone employeeId")
      .sort({ submittedAt: -1 });
      
    res.json(reports);
  } catch (error) {
    console.error("Get all reports error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.approveReport = async (req, res) => {
  try {
    const report = await WorkReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    report.status = "approved";
    await report.save();

    const complaint = await Complaint.findById(report.complaintId);
    if (complaint) {
      complaint.status = "COMPLETED";
      await complaint.save();
    }

    res.json({ message: "Report approved successfully", report });
  } catch (error) {
    console.error("Approve report error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.rejectReport = async (req, res) => {
  try {
    const report = await WorkReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    report.status = "rejected";
    await report.save();

    const complaint = await Complaint.findById(report.complaintId);
    if (complaint) {
      complaint.status = "IN_PROGRESS";
      await complaint.save();
    }

    res.json({ message: "Report rejected successfully", report });
  } catch (error) {
    console.error("Reject report error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
