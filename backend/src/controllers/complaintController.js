const Complaint = require("../models/Complaint");

exports.getAssignedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      assignedWorker: req.worker._id,
    }).sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    console.error("Get complaints error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.assignedWorker.toString() !== req.worker._id.toString()) {
      return res
        .status(403)
        .json({ message: "This complaint is not assigned to you" });
    }

    res.json(complaint);
  } catch (error) {
    console.error("Get complaint error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.startWork = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.assignedWorker.toString() !== req.worker._id.toString()) {
      return res
        .status(403)
        .json({ message: "This complaint is not assigned to you" });
    }

    if (complaint.status !== "ASSIGNED") {
      return res.status(400).json({
        message: `Cannot start work. Current status: ${complaint.status}`,
      });
    }

    complaint.status = "IN_PROGRESS";
    complaint.startTime = new Date();
    await complaint.save();

    res.json(complaint);
  } catch (error) {
    console.error("Start work error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
