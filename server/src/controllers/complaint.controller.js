import mongoose from "mongoose";
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
import {
  getCache,
  setCache,
  invalidateComplaintCaches,
  buildAnalyticsCacheKey,
  buildComplaintListCacheKey,
  buildComplaintDetailCacheKey,
  CACHE_TTL,
} from "../utils/cache.js";
import { enqueueNotificationJob } from "../queues/notification.queue.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const ALLOWED_SORT_FIELDS = {
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  priority: "priority",
  status: "status",
  title: "title",
  newest: "createdAt",
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

  if (!title || typeof title !== "string" || title.trim().length < 3) {
    throw new ApiError(400, "title must be at least 3 characters");
  }

  if (!description || typeof description !== "string" || description.trim().length < 10) {
    throw new ApiError(400, "description must be at least 10 characters");
  }

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
    title: title.trim(),
    description: description.trim(),
    category,
    priority: priority || "Medium",
    student: req.user._id,
    studentName: req.user.name,
    studentEmail: req.user.email?.toLowerCase?.() || req.user.email,
    hostel: (hostel && typeof hostel === "string" && hostel.trim()) || req.user.hostel,
    roomNumber: (roomNumber && typeof roomNumber === "string" && roomNumber.trim()) || req.user.room,
    images,
    timeline: [
      buildTimelineEntry("Pending", "Complaint submitted", req.user.name),
    ],
  });

  await invalidateComplaintCaches();

  enqueueNotificationJob("complaint.created", {
    complaintId: complaint._id.toString(),
    title: complaint.title,
    category: complaint.category,
    priority: complaint.priority,
    hostel: complaint.hostel,
    studentId: req.user._id.toString(),
    studentName: req.user.name,
  }).catch(() => {});

  return res
    .status(201)
    .json(new ApiResponse(201, formatComplaint(complaint), "Complaint created successfully"));
});

export const listComplaints = asyncHandler(async (req, res) => {
  const {
    page,
    limit,
    status,
    category,
    priority,
    studentId,
    student,
    search,
    sortBy,
    sort,
    sortOrder,
    order,
    hostel,
    roomNumber,
    assignedTo,
  } = req.query;

  // Pagination validation and parsing
  let pageNum = DEFAULT_PAGE;
  if (page !== undefined) {
    const parsedPage = parseInt(page, 10);
    if (!/^\d+$/.test(String(page).trim()) || isNaN(parsedPage) || parsedPage < 1) {
      throw new ApiError(400, "page must be a positive integer greater than or equal to 1");
    }
    pageNum = parsedPage;
  }

  let limitNum = DEFAULT_LIMIT;
  if (limit !== undefined) {
    const parsedLimit = parseInt(limit, 10);
    if (
      !/^\d+$/.test(String(limit).trim()) ||
      isNaN(parsedLimit) ||
      parsedLimit < 1 ||
      parsedLimit > MAX_LIMIT
    ) {
      throw new ApiError(400, `limit must be an integer between 1 and ${MAX_LIMIT}`);
    }
    limitNum = parsedLimit;
  }

  const filter = {};

  // Role-based scoping
  if (req.user.role === "student") {
    filter.student = req.user._id;
  } else {
    const targetStudent = studentId || student;
    if (targetStudent) {
      if (!mongoose.isValidObjectId(targetStudent)) {
        throw new ApiError(400, "student must be a valid ObjectId");
      }
      filter.student = targetStudent;
    }
  }

  // Enum filtering
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

  // Additional complaint fields filtering
  if (hostel && typeof hostel === "string" && hostel.trim()) {
    filter.hostel = hostel.trim();
  }

  if (roomNumber && typeof roomNumber === "string" && roomNumber.trim()) {
    filter.roomNumber = roomNumber.trim();
  }

  if (assignedTo && typeof assignedTo === "string" && assignedTo.trim()) {
    filter.assignedTo = assignedTo.trim();
  }

  // Search in title and description using MongoDB queries
  if (search && typeof search === "string" && search.trim()) {
    const sanitizedSearch = escapeRegex(search.trim());
    const searchRegex = new RegExp(sanitizedSearch, "i");
    filter.$or = [
      { title: searchRegex },
      { description: searchRegex },
    ];
  }

  // Safe whitelisted sorting
  const requestedSort = sortBy || sort || "createdAt";
  if (!ALLOWED_SORT_FIELDS[requestedSort]) {
    throw new ApiError(
      400,
      "Invalid sortBy field. Allowed fields: createdAt, updatedAt, priority, status, title"
    );
  }
  const sortField = ALLOWED_SORT_FIELDS[requestedSort];

  const requestedOrder = (sortOrder || order || "").toLowerCase();
  if (
    requestedOrder &&
    !["asc", "desc", "1", "-1", "ascending", "descending"].includes(requestedOrder)
  ) {
    throw new ApiError(400, "sortOrder must be 'asc' or 'desc'");
  }
  const isAsc = requestedOrder === "asc" || requestedOrder === "1" || requestedOrder === "ascending";
  const sortDirection = isAsc ? 1 : -1;

  const sortOptions = { [sortField]: sortDirection };
  if (sortField !== "_id") {
    sortOptions._id = -1;
  }

  const skip = (pageNum - 1) * limitNum;

  const cacheKey = buildComplaintListCacheKey(req.user, req.query);
  const cached = await getCache(cacheKey);

  if (cached) {
    return res.status(200).json(
      new ApiResponse(
        200,
        cached.complaints,
        "Complaints fetched successfully",
        cached.pagination
      )
    );
  }

  const [total, complaints] = await Promise.all([
    Complaint.countDocuments(filter),
    Complaint.find(filter).sort(sortOptions).skip(skip).limit(limitNum),
  ]);

  const totalPages = Math.ceil(total / limitNum) || 0;
  const pagination = {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages,
    hasNextPage: pageNum < totalPages,
    hasPrevPage: pageNum > 1 && totalPages > 0,
  };

  const formattedComplaints = complaints.map(formatComplaint);
  await setCache(
    cacheKey,
    { complaints: formattedComplaints, pagination },
    CACHE_TTL.COMPLAINT_LIST
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      formattedComplaints,
      "Complaints fetched successfully",
      pagination
    )
  );
});

export const getComplaintById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid complaint ID format");
  }

  const cacheKey = buildComplaintDetailCacheKey(id);
  let formatted = await getCache(cacheKey);

  if (!formatted) {
    const complaint = await Complaint.findById(id);

    if (!complaint) {
      throw new ApiError(404, "Complaint not found");
    }

    formatted = formatComplaint(complaint);
    await setCache(cacheKey, formatted, CACHE_TTL.COMPLAINT_DETAIL);
  }

  const studentOwnerId =
    formatted.studentId?.toString?.() || formatted.student?.toString?.();
  if (
    req.user.role === "student" &&
    studentOwnerId !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Forbidden");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, formatted, "Complaint fetched successfully"));
});

export const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid complaint ID format");
  }

  if (!status || !COMPLAINT_STATUSES.includes(status)) {
    throw new ApiError(400, `status must be one of: ${COMPLAINT_STATUSES.join(", ")}`);
  }

  const complaint = await Complaint.findById(id);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  complaint.status = status;
  complaint.timeline.push(
    buildTimelineEntry(status, note?.trim?.() || `Status updated to ${status}`, req.user.name)
  );

  await complaint.save();
  await invalidateComplaintCaches({ complaintId: id });

  enqueueNotificationJob("complaint.status_updated", {
    complaintId: complaint._id.toString(),
    title: complaint.title,
    status: complaint.status,
    studentId: complaint.student.toString(),
    note: note?.trim?.() || "",
  }).catch(() => {});

  return res
    .status(200)
    .json(new ApiResponse(200, formatComplaint(complaint), "Complaint status updated"));
});

export const updateComplaintPriority = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { priority } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid complaint ID format");
  }

  if (!priority || !COMPLAINT_PRIORITIES.includes(priority)) {
    throw new ApiError(400, `priority must be one of: ${COMPLAINT_PRIORITIES.join(", ")}`);
  }

  const complaint = await Complaint.findById(id);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  complaint.priority = priority;
  await complaint.save();
  await invalidateComplaintCaches({ complaintId: id });

  enqueueNotificationJob("complaint.priority_updated", {
    complaintId: complaint._id.toString(),
    title: complaint.title,
    priority: complaint.priority,
    studentId: complaint.student.toString(),
  }).catch(() => {});

  return res
    .status(200)
    .json(new ApiResponse(200, formatComplaint(complaint), "Complaint priority updated"));
});

export const updateComplaintResolution = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { resolution } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid complaint ID format");
  }

  if (
    !resolution ||
    typeof resolution !== "string" ||
    !resolution.trim() ||
    resolution.trim().length < 3
  ) {
    throw new ApiError(400, "resolution is required and must be at least 3 characters");
  }

  const complaint = await Complaint.findById(id);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  const trimmedResolution = resolution.trim();
  complaint.resolution = trimmedResolution;
  complaint.status = "Resolved";
  complaint.timeline.push(
    buildTimelineEntry("Resolved", trimmedResolution, req.user.name)
  );

  await complaint.save();
  await invalidateComplaintCaches({ complaintId: id });

  enqueueNotificationJob("complaint.resolution_updated", {
    complaintId: complaint._id.toString(),
    title: complaint.title,
    resolution: trimmedResolution,
    studentId: complaint.student.toString(),
  }).catch(() => {});

  return res
    .status(200)
    .json(new ApiResponse(200, formatComplaint(complaint), "Complaint resolved"));
});

export const getComplaintAnalytics = asyncHandler(async (req, res) => {
  const cacheKey = buildAnalyticsCacheKey(req.query);
  const cachedAnalytics = await getCache(cacheKey);

  if (cachedAnalytics) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          cachedAnalytics,
          "Complaint analytics fetched successfully"
        )
      );
  }

  const {
    startDate,
    endDate,
    from,
    to,
    category,
    status,
    priority,
    hostel,
    studentId,
    student,
  } = req.query;

  const matchFilter = {};

  const start = startDate || from;
  const end = endDate || to;

  if (start || end) {
    matchFilter.createdAt = {};
    if (start) {
      matchFilter.createdAt.$gte = new Date(start);
    }
    if (end) {
      const endDateObj = new Date(end);
      if (/^\d{4}-\d{2}-\d{2}$/.test(String(end).trim())) {
        endDateObj.setUTCHours(23, 59, 59, 999);
      }
      matchFilter.createdAt.$lte = endDateObj;
    }
  }

  if (category) {
    matchFilter.category = category;
  }

  if (status) {
    matchFilter.status = status;
  }

  if (priority) {
    matchFilter.priority = priority;
  }

  if (hostel && typeof hostel === "string" && hostel.trim()) {
    matchFilter.hostel = hostel.trim();
  }

  const targetStudent = studentId || student;
  if (targetStudent) {
    matchFilter.student = new mongoose.Types.ObjectId(targetStudent);
  }

  const [pipelineResult] = await Complaint.aggregate([
    { $match: matchFilter },
    {
      $facet: {
        overview: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              resolved: {
                $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] },
              },
              unresolved: {
                $sum: { $cond: [{ $ne: ["$status", "Resolved"] }, 1, 0] },
              },
              pending: {
                $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
              },
              inProgress: {
                $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] },
              },
              highPriority: {
                $sum: { $cond: [{ $eq: ["$priority", "High"] }, 1, 0] },
              },
              highPriorityUnresolved: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$priority", "High"] },
                        { $ne: ["$status", "Resolved"] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ],
        byStatus: [
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ],
        byPriority: [
          {
            $group: {
              _id: "$priority",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ],
        byCategory: [
          {
            $group: {
              _id: "$category",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ],
        topCategories: [
          {
            $group: {
              _id: "$category",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ],
        trend: [
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ],
        byHostel: [
          {
            $match: { hostel: { $exists: true, $ne: "" } },
          },
          {
            $group: {
              _id: "$hostel",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ],
        resolutionTime: [
          {
            $match: { status: "Resolved" },
          },
          {
            $project: {
              createdAt: 1,
              resolvedEntries: {
                $filter: {
                  input: { $ifNull: ["$timeline", []] },
                  as: "t",
                  cond: { $eq: ["$$t.status", "Resolved"] },
                },
              },
            },
          },
          {
            $project: {
              createdAt: 1,
              resolvedAt: { $arrayElemAt: ["$resolvedEntries.timestamp", -1] },
            },
          },
          {
            $match: {
              resolvedAt: { $ne: null },
            },
          },
          {
            $project: {
              diffHours: {
                $divide: [{ $subtract: ["$resolvedAt", "$createdAt"] }, 3600000],
              },
              diffDays: {
                $divide: [{ $subtract: ["$resolvedAt", "$createdAt"] }, 86400000],
              },
            },
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              avgHours: { $avg: "$diffHours" },
              avgDays: { $avg: "$diffDays" },
            },
          },
        ],
      },
    },
  ]);

  const overview = pipelineResult?.overview?.[0] || {
    total: 0,
    resolved: 0,
    unresolved: 0,
    pending: 0,
    inProgress: 0,
    highPriority: 0,
    highPriorityUnresolved: 0,
  };

  const statusMap = Object.fromEntries(
    (pipelineResult?.byStatus || []).map((row) => [row._id, row.count])
  );
  const priorityMap = Object.fromEntries(
    (pipelineResult?.byPriority || []).map((row) => [row._id, row.count])
  );
  const categoryMap = Object.fromEntries(
    (pipelineResult?.byCategory || []).map((row) => [row._id, row.count])
  );

  const byStatus = COMPLAINT_STATUSES.map((name) => ({
    name,
    value: statusMap[name] || 0,
    count: statusMap[name] || 0,
  }));

  const byPriority = COMPLAINT_PRIORITIES.map((name) => ({
    name,
    value: priorityMap[name] || 0,
    count: priorityMap[name] || 0,
  }));

  const byCategory = COMPLAINT_CATEGORIES.map((name) => ({
    name,
    value: categoryMap[name] || 0,
    count: categoryMap[name] || 0,
  }));

  const topCategories = (pipelineResult?.topCategories || []).map((row) => ({
    name: row._id,
    category: row._id,
    value: row.count,
    count: row.count,
  }));

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const trend = (pipelineResult?.trend || []).map((row) => {
    const monthIndex = (row._id?.month || 1) - 1;
    const year = row._id?.year;
    const month = monthNames[monthIndex] || `M${row._id?.month}`;
    return {
      month,
      year,
      period: `${year}-${String(row._id?.month).padStart(2, "0")}`,
      count: row.count,
    };
  });

  const resTime = pipelineResult?.resolutionTime?.[0];
  const avgResolutionHours = resTime?.avgHours
    ? Math.round(resTime.avgHours * 10) / 10
    : 0;
  const avgResolutionDays = resTime?.avgDays
    ? Math.round(resTime.avgDays * 10) / 10
    : 0;

  const byHostel = (pipelineResult?.byHostel || []).map((row) => ({
    hostel: row._id,
    name: row._id,
    count: row.count,
    value: row.count,
  }));

  const statusCounts = Object.fromEntries(
    COMPLAINT_STATUSES.map((s) => [s, statusMap[s] || 0])
  );
  const priorityCounts = Object.fromEntries(
    COMPLAINT_PRIORITIES.map((p) => [p, priorityMap[p] || 0])
  );
  const categoryCounts = Object.fromEntries(
    COMPLAINT_CATEGORIES.map((c) => [c, categoryMap[c] || 0])
  );

  const analyticsData = {
    total: overview.total,
    resolved: overview.resolved,
    unresolved: overview.unresolved,
    pending: overview.pending,
    inProgress: overview.inProgress,
    highPriority: overview.highPriority,
    highPriorityUnresolved: overview.highPriorityUnresolved,
    byStatus,
    byPriority,
    byCategory,
    topCategories,
    statusCounts,
    priorityCounts,
    categoryCounts,
    trend,
    avgResolutionDays,
    avgResolutionHours,
    resolutionTime: {
      avgDays: avgResolutionDays,
      avgHours: avgResolutionHours,
      resolvedCountWithTimestamps: resTime?.count || 0,
    },
    byHostel,
  };

  await setCache(cacheKey, analyticsData, CACHE_TTL.ANALYTICS);

  return res
    .status(200)
    .json(new ApiResponse(200, analyticsData, "Complaint analytics fetched successfully"));
});


