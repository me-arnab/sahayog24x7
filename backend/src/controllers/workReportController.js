const Complaint = require("../models/Complaint");
const WorkReport = require("../models/WorkReport");
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

    const complaint = await Complaint.findById(complaintId);
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
    });

    complaint.status = "COMPLETED";
    complaint.endTime = new Date();
    complaint.timeTakenInSeconds = Math.floor(
      (complaint.endTime - complaint.startTime) / 1000
    );
    await complaint.save();

    res.status(201).json({ workReport, complaint });
  } catch (error) {
    console.error("Submit report error:", error);

    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }

    res.status(500).json({ message: "Server error" });
  }
};
