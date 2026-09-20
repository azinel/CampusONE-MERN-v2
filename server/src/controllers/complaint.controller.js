import Complaint from "../models/Complaint.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_PRIORITIES,
  COMPLAINT_STATUSES,
} from "../constants/index.js";

const formatComplaint = (complaint) => ({
  id: complaint._id,
  title: complaint.title,
  description: complaint.description,
  category: complaint.category,
  status: complaint.status,
  priority: complaint.priority,
  studentId: complaint.student?.toString?.() || complaint.student,
  studentName: complaint.studentName,
  studentEmail: complaint.studentEmail,
  hostel: complaint.hostel,
  roomNumber: complaint.roomNumber,
  images: complaint.images,
  assignedTo: complaint.assignedTo,
  resolution: complaint.resolution,
  timeline: complaint.timeline,
  createdAt: complaint.createdAt,
  updatedAt: complaint.updatedAt,
});

const buildTimelineEntry = (status, note, actor) => ({
  status,
  note: note || "",
  timestamp: new Date(),
  actor: actor || "",
});

export const createComplaint = asyncHandler(async (req, res) => {
  const { title, description, category, priority, hostel, roomNumber } = req.body;

  if (!COMPLAINT_CATEGORIES.includes(category)) {
    throw new ApiError(400, `category must be one of: ${COMPLAINT_CATEGORIES.join(", ")}`);
  }

  if (priority && !COMPLAINT_PRIORITIES.includes(priority)) {
    throw new ApiError(400, `priority must be one of: ${COMPLAINT_PRIORITIES.join(", ")}`);
  }

  const images = [];

  if (req.files?.length) {
    for (const file of req.files) {
      const uploaded = await uploadOnCloudinary(file.path);
      if (uploaded?.secure_url || uploaded?.url) {
        images.push(uploaded.secure_url || uploaded.url);
      }
    }
  }

  const complaint = await Complaint.create({
    title,
    description,
    category,
    priority: priority || "Medium",
    student: req.user._id,
    studentName: req.user.name,
    studentEmail: req.user.email,
    hostel: hostel || req.user.hostel,
    roomNumber: roomNumber || req.user.room,
    images,
    timeline: [
      buildTimelineEntry("Pending", "Complaint submitted", req.user.name),
    ],
  });

  return res
    .status(201)
    .json(new ApiResponse(201, formatComplaint(complaint), "Complaint created successfully"));
});

export const listComplaints = asyncHandler(async (req, res) => {
  const { status, category, priority, search, sortBy } = req.query;
  const filter = {};

  if (req.user.role === "student") {
    filter.student = req.user._id;
  }

  if (status) {
    if (!COMPLAINT_STATUSES.includes(status)) {
      throw new ApiError(400, `status must be one of: ${COMPLAINT_STATUSES.join(", ")}`);
    }
    filter.status = status;
  }

  if (category) {
    if (!COMPLAINT_CATEGORIES.includes(category)) {
      throw new ApiError(400, `category must be one of: ${COMPLAINT_CATEGORIES.join(", ")}`);
    }
    filter.category = category;
  }

  if (priority) {
    if (!COMPLAINT_PRIORITIES.includes(priority)) {
      throw new ApiError(400, `priority must be one of: ${COMPLAINT_PRIORITIES.join(", ")}`);
    }
    filter.priority = priority;
  }

  if (search) {
    const pattern = new RegExp(search, "i");
    filter.$or = [
      { title: pattern },
      { description: pattern },
      { hostel: pattern },
      { studentName: pattern },
    ];
  }

  let complaints = await Complaint.find(filter).sort({ createdAt: -1 });

  if (sortBy === "priority") {
    const order = { High: 0, Medium: 1, Low: 2 };
    complaints = complaints.sort(
      (a, b) => (order[a.priority] ?? 99) - (order[b.priority] ?? 99)
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      complaints.map(formatComplaint),
      "Complaints fetched successfully"
    )
  );
});

export const getComplaintById = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  if (
    req.user.role === "student" &&
    complaint.student.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Forbidden");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, formatComplaint(complaint), "Complaint fetched successfully"));
});

export const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

  if (!COMPLAINT_STATUSES.includes(status)) {
    throw new ApiError(400, `status must be one of: ${COMPLAINT_STATUSES.join(", ")}`);
  }

  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  complaint.status = status;
  complaint.timeline.push(
    buildTimelineEntry(status, note || `Status updated to ${status}`, req.user.name)
  );

  await complaint.save();

  return res
    .status(200)
    .json(new ApiResponse(200, formatComplaint(complaint), "Complaint status updated"));
});

export const updateComplaintPriority = asyncHandler(async (req, res) => {
  const { priority } = req.body;

  if (!COMPLAINT_PRIORITIES.includes(priority)) {
    throw new ApiError(400, `priority must be one of: ${COMPLAINT_PRIORITIES.join(", ")}`);
  }

  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  complaint.priority = priority;
  await complaint.save();

  return res
    .status(200)
    .json(new ApiResponse(200, formatComplaint(complaint), "Complaint priority updated"));
});

export const updateComplaintResolution = asyncHandler(async (req, res) => {
  const { resolution } = req.body;

  if (!resolution?.trim()) {
    throw new ApiError(400, "resolution is required");
  }

  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  complaint.resolution = resolution.trim();
  complaint.status = "Resolved";
  complaint.timeline.push(
    buildTimelineEntry("Resolved", resolution.trim(), req.user.name)
  );

  await complaint.save();

  return res
    .status(200)
    .json(new ApiResponse(200, formatComplaint(complaint), "Complaint resolved"));
});
