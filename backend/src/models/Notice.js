const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: 5000,
    },
    type: {
      type: String,
      enum: ["Maintenance", "Payment", "Outage", "General"],
      required: [true, "Notice type is required"],
    },
    audience: {
      type: String,
      enum: ["Citizen", "Worker"],
      required: [true, "Audience is required"],
    },
    status: {
      type: String,
      enum: ["Active", "Scheduled", "Inactive"],
      default: "Active",
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

noticeSchema.index({ title: "text", message: "text" });
noticeSchema.index({ status: 1, type: 1, startDate: 1 });

module.exports = mongoose.model("Notice", noticeSchema);
