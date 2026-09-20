import mongoose from "mongoose";
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_PRIORITIES,
  COMPLAINT_STATUSES,
} from "../constants/index.js";

const timelineEntrySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: COMPLAINT_STATUSES,
      required: true,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    actor: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: COMPLAINT_CATEGORIES,
      required: true,
    },
    status: {
      type: String,
      enum: COMPLAINT_STATUSES,
      default: "Pending",
    },
    priority: {
      type: String,
      enum: COMPLAINT_PRIORITIES,
      default: "Medium",
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    studentEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    hostel: {
      type: String,
      required: true,
      trim: true,
    },
    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    assignedTo: {
      type: String,
      default: null,
    },
    resolution: {
      type: String,
      default: null,
    },
    timeline: {
      type: [timelineEntrySchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Complaint", complaintSchema);
