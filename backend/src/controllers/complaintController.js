const Complaint = require("../models/Complaint");
const Worker = require("../models/Worker");

const generateComplaintId = async () => {
  const latest = await Complaint.findOne({}, { complaintId: 1 })
    .sort({ createdAt: -1 })
    .lean();

  const match = latest?.complaintId?.match(/(\d+)$/);
  const nextNumber = match ? Number(match[1]) + 1 : 1;
  return `CMP-${String(nextNumber).padStart(4, "0")}`;
};

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

exports.createComplaint = async (req, res) => {
  try {
    const citizen = req.user;
    if (!citizen) {
      return res.status(403).json({ message: "Citizen authentication required" });
    }

    const {
      name,
      phone,
      consumerId,
      location,
      zone,
      issueType,
      description,
      emergency,
    } = req.body;

    if (!issueType || !description) {
      return res.status(400).json({
        message: "issueType and description are required",
      });
    }

    const complaintId = await generateComplaintId();
    const complaint = await Complaint.create({
      complaintId,
      userId: citizen._id,
      consumerName: String(name || citizen.name || "").trim(),
      phone: String(phone || citizen.phone || "").trim(),
      location: String(location || consumerId || citizen.consumerId || "").trim(),
      zone: String(zone || "ward-1").trim(),
      issueType: String(issueType).trim(),
      address: String(location || consumerId || citizen.consumerId || "").trim(),
      description: String(description).trim(),
      emergency:
        emergency === true ||
        emergency === "true" ||
        emergency === 1 ||
        emergency === "1",
      status: "received",
      priority: String(req.body.priority || "low").trim(),
      photos: Array.isArray(req.body.photos) ? req.body.photos : [],
      assignedWorker: null,
      assignedTeam: null,
    });

    res.status(201).json({
      message: "Complaint submitted successfully",
      complaint,
    });
  } catch (error) {
    console.error("Create complaint error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyComplaints = async (req, res) => {
  try {
    const citizen = req.user;
    if (!citizen) {
      return res.status(403).json({ message: "Citizen authentication required" });
    }

    const complaints = await Complaint.find({ userId: citizen._id }).sort({
      createdAt: -1,
    });

    res.json(complaints);
  } catch (error) {
    console.error("Get citizen complaints error:", error);
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

    if (
      req.worker &&
      complaint.assignedWorker &&
      complaint.assignedWorker.toString() === req.worker._id.toString()
    ) {
      return res.json(complaint);
    }

    if (
      req.user &&
      complaint.userId &&
      complaint.userId.toString() === req.user._id.toString()
    ) {
      return res.json(complaint);
    }

    if (!req.worker) {
      return res
        .status(403)
        .json({ message: "This complaint does not belong to you" });
    }

    if (!complaint.assignedWorker || complaint.assignedWorker.toString() !== req.worker._id.toString()) {
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
    if (!req.worker) {
      return res.status(403).json({ message: "Worker authentication required" });
    }

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

exports.getComplaintCounts = async (req, res) => {
  try {
    const citizen = req.user;
    const filter = citizen ? { userId: citizen._id } : {};
    const total = await Complaint.countDocuments(filter);
    const received = await Complaint.countDocuments({ ...filter, status: "received" });
    const inProgress = await Complaint.countDocuments({
      ...filter,
      status: { $in: ["IN_PROGRESS", "in-progress"] },
    });
    const resolved = await Complaint.countDocuments({
      ...filter,
      status: { $in: ["COMPLETED", "resolved"] },
    });

    res.json({
      total,
      pending: received,
      inProgress,
      resolved,
      assigned: await Complaint.countDocuments({ ...filter, status: "ASSIGNED" }),
    });
  } catch (error) {
    console.error("Complaint stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAdminComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({}).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error("Get admin complaints error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
