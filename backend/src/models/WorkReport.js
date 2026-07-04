const mongoose = require("mongoose");

const workReportSchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Complaint",
    required: true,
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Worker",
    required: true,
  },
  afterPhoto: {
    type: String,
    required: true,
  },
  workPerformed: {
    type: String,
    required: true,
    trim: true,
  },
  conditionAfter: {
    type: String,
    required: true,
    trim: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("WorkReport", workReportSchema);
