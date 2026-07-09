const Complaint = require("../models/Complaint");
const Worker = require("../models/Worker");

exports.seedComplaints = async (req, res) => {
  try {
    const { employeeId, complaints } = req.body;

    if (!employeeId || !complaints || !Array.isArray(complaints) || complaints.length === 0) {
      return res.status(400).json({ message: "employeeId and complaints array are required" });
    }

    const worker = await Worker.findOne({ employeeId });
    if (!worker) {
      return res.status(404).json({ message: `Worker with employeeId "${employeeId}" not found. Seed a worker first.` });
    }

    const complaintDocs = complaints.map((c, i) => ({
      complaintId: c.complaintId || `CMP-${Date.now()}-${i}`,
      consumerName: c.consumerName,
      address: c.address,
      description: c.description,
      emergency:
        c.emergency === true ||
        c.emergency === "true" ||
        c.emergency === 1 ||
        c.emergency === "1",
      status: "ASSIGNED",
      assignedWorker: worker._id,
    }));

    const created = await Complaint.insertMany(complaintDocs);

    res.status(201).json({
      message: `${created.length} complaints created for ${worker.name}`,
      complaints: created,
    });
  } catch (error) {
    console.error("Seed complaints error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAssignedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      assignedWorker: req.worker._id,
    }).sort({ createdAt: 1 });

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
