const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    consumerName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    issueType: {
      type: String,
      default: "",
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    addressType: {
      type: String,
      enum: ["RURAL", "URBAN"],
      default: "URBAN",
    },
    locationMethod: {
      type: String,
      enum: ["GPS", "MANUAL"],
      default: "MANUAL",
    },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    accuracy: { type: Number, default: null },
    capturedAt: { type: Date, default: null },
    state: { type: String, default: "", trim: true },
    district: { type: String, default: "", trim: true },
    subDivision: { type: String, default: "", trim: true },
    block: { type: String, default: "", trim: true },
    gramPanchayat: { type: String, default: "", trim: true },
    municipality: { type: String, default: "", trim: true },
    wardNumber: { type: String, default: "", trim: true },
    village: { type: String, default: "", trim: true },
    locality: { type: String, default: "", trim: true },
    road: { type: String, default: "", trim: true },
    houseNumber: { type: String, default: "", trim: true },
    pinCode: { type: String, default: "", trim: true },
    fullAddress: { type: String, default: "", trim: true },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    emergency: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["received", "ASSIGNED", "IN_PROGRESS", "PENDING_APPROVAL", "COMPLETED", "in-progress", "resolved", "escalated"],
      default: "received",
    },
    priority: {
      type: String,
      default: "low",
      trim: true,
    },
    photos: {
      type: [String],
      default: [],
    },
    assignedWorker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      default: null,
    },
    assignedTeam: {
      type: String,
      default: null,
      trim: true,
    },
    startTime: {
      type: Date,
      default: null,
    },
    endTime: {
      type: Date,
      default: null,
    },
    timeTakenInSeconds: {
      type: Number,
      default: null,
    },
    resolutionNotes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
