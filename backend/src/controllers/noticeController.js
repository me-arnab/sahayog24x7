const Notice = require("../models/Notice");

// ─── Get Stats ───
exports.getStats = async (req, res) => {
  try {
    const now = new Date();
    const [total, active, scheduled, inactive] = await Promise.all([
      Notice.countDocuments(),
      Notice.countDocuments({ status: "Active" }),
      Notice.countDocuments({
        status: "Scheduled",
        startDate: { $gte: now },
      }),
      Notice.countDocuments({ status: "Inactive" }),
    ]);
    res.json({ total, active, scheduled, inactive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Create Notice ───
exports.createNotice = async (req, res) => {
  try {
    const { title, message, type, audience, startDate, endDate, status } =
      req.body;

    if (!title || !message || !type || !audience || !startDate || !endDate) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ message: "End date must be on or after start date" });
    }

    if (message.length > 5000) {
      return res.status(400).json({ message: "Message must not exceed 5000 characters" });
    }

    const notice = await Notice.create({
      title,
      message,
      type,
      audience,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: status || "Active",
      createdBy: req.user?.id || req.user?._id,
    });

    res.status(201).json({ message: "Notice created successfully", notice });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: error.message });
  }
};

// ─── Get Notices (paginated, filtered, sorted) ───
exports.getNotices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      type,
      sort = "newest",
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    if (status) filter.status = status;
    if (type) filter.type = type;

    const sortOrder = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [notices, total] = await Promise.all([
      Notice.find(filter).sort(sortOrder).skip(skip).limit(limitNum).lean(),
      Notice.countDocuments(filter),
    ]);

    res.json({
      notices,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get Single Notice ───
exports.getNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id).lean();
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }
    res.json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Update Notice ───
exports.updateNotice = async (req, res) => {
  try {
    const { title, message, type, audience, startDate, endDate, status } =
      req.body;

    if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ message: "End date must be on or after start date" });
    }

    if (message && message.length > 5000) {
      return res.status(400).json({ message: "Message must not exceed 5000 characters" });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (message !== undefined) updateData.message = message;
    if (type !== undefined) updateData.type = type;
    if (audience !== undefined) updateData.audience = audience;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (status !== undefined) updateData.status = status;

    const notice = await Notice.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    res.json({ message: "Notice updated successfully", notice });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: error.message });
  }
};

// ─── Delete Notice ───
exports.deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }
    res.json({ message: "Notice deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Toggle Status ───
exports.toggleStatus = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    const newStatus =
      notice.status === "Active"
        ? "Inactive"
        : notice.status === "Inactive"
        ? "Active"
        : "Active";

    notice.status = newStatus;
    await notice.save();

    res.json({
      message: `Notice ${newStatus === "Active" ? "activated" : "deactivated"} successfully`,
      notice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Consumer-facing: get active/scheduled notices ───
exports.getConsumerNotices = async (req, res) => {
  try {
    const now = new Date();
    const notices = await Notice.find({
      status: { $in: ["Active", "Scheduled"] },
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`[getConsumerNotices] Found ${notices.length} active notices`);
    console.log(`[getConsumerNotices] Notices:`, JSON.stringify(notices, null, 2));

    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
