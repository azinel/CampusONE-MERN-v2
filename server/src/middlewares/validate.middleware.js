import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_PRIORITIES,
  COMPLAINT_STATUSES,
} from "../constants/index.js";

export const validateBody = (rules) => (req, _res, next) => {
  const errors = [];

  for (const [field, rule] of Object.entries(rules)) {
    const value = req.body?.[field];

    if (rule.required && (value === undefined || value === null || String(value).trim() === "")) {
      errors.push(`${field} is required`);
      continue;
    }

    if (value === undefined || value === null || value === "") {
      continue;
    }

    if (rule.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
      errors.push(`${field} must be a valid email`);
    }

    if (rule.minLength && String(value).trim().length < rule.minLength) {
      errors.push(`${field} must be at least ${rule.minLength} characters`);
    }

    if (rule.maxLength && String(value).trim().length > rule.maxLength) {
      errors.push(`${field} must be at most ${rule.maxLength} characters`);
    }

    if (rule.enum && !rule.enum.includes(value)) {
      errors.push(`${field} must be one of: ${rule.enum.join(", ")}`);
    }

    if (rule.isObjectId && !mongoose.isValidObjectId(value)) {
      errors.push(`${field} must be a valid ObjectId`);
    }
  }

  if (errors.length) {
    throw new ApiError(400, errors.join("; "), errors);
  }

  next();
};

export const validateObjectId = (paramName = "id") => (req, _res, next) => {
  const id = req.params?.[paramName];
  if (!id || !mongoose.isValidObjectId(id)) {
    const message = `Invalid ${paramName}: must be a valid ObjectId`;
    throw new ApiError(400, message, [message]);
  }
  next();
};

export const validateComplaintQuery = (req, _res, next) => {
  const errors = [];
  const {
    page,
    limit,
    status,
    category,
    priority,
    studentId,
    student,
    sortBy,
    sort,
    sortOrder,
    order,
    search,
    hostel,
    roomNumber,
    assignedTo,
  } = req.query;

  if (page !== undefined) {
    const isInt = /^\d+$/.test(String(page).trim());
    const val = Number(page);
    if (!isInt || val < 1) {
      errors.push("page must be a positive integer greater than or equal to 1");
    }
  }

  if (limit !== undefined) {
    const isInt = /^\d+$/.test(String(limit).trim());
    const val = Number(limit);
    if (!isInt || val < 1 || val > 100) {
      errors.push("limit must be an integer between 1 and 100");
    }
  }

  if (status !== undefined && !COMPLAINT_STATUSES.includes(status)) {
    errors.push(`status must be one of: ${COMPLAINT_STATUSES.join(", ")}`);
  }

  if (category !== undefined && !COMPLAINT_CATEGORIES.includes(category)) {
    errors.push(`category must be one of: ${COMPLAINT_CATEGORIES.join(", ")}`);
  }

  if (priority !== undefined && !COMPLAINT_PRIORITIES.includes(priority)) {
    errors.push(`priority must be one of: ${COMPLAINT_PRIORITIES.join(", ")}`);
  }

  const studentTarget = studentId || student;
  if (studentTarget !== undefined && !mongoose.isValidObjectId(studentTarget)) {
    errors.push("student must be a valid ObjectId");
  }

  const requestedSort = sortBy || sort;
  const allowedSortFields = [
    "createdAt",
    "updatedAt",
    "priority",
    "status",
    "title",
    "newest",
  ];
  if (requestedSort !== undefined && !allowedSortFields.includes(requestedSort)) {
    errors.push("sortBy must be one of: createdAt, updatedAt, priority, status, title");
  }

  const requestedOrder = sortOrder || order;
  const allowedOrders = ["asc", "desc", "1", "-1", "ascending", "descending"];
  if (requestedOrder !== undefined && !allowedOrders.includes(String(requestedOrder).toLowerCase())) {
    errors.push("sortOrder must be 'asc' or 'desc'");
  }

  if (search !== undefined && typeof search === "string" && search.length > 200) {
    errors.push("search query must not exceed 200 characters");
  }

  if (hostel !== undefined && typeof hostel === "string" && hostel.length > 100) {
    errors.push("hostel must not exceed 100 characters");
  }

  if (roomNumber !== undefined && typeof roomNumber === "string" && roomNumber.length > 50) {
    errors.push("roomNumber must not exceed 50 characters");
  }

  if (assignedTo !== undefined && typeof assignedTo === "string" && assignedTo.length > 100) {
    errors.push("assignedTo must not exceed 100 characters");
  }

  if (errors.length) {
    throw new ApiError(400, errors.join("; "), errors);
  }

  next();
};

export const validateComplaintAnalyticsQuery = (req, _res, next) => {
  const errors = [];
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

  const start = startDate || from;
  const end = endDate || to;

  let parsedStart = null;
  let parsedEnd = null;

  if (start !== undefined) {
    parsedStart = new Date(start);
    if (isNaN(parsedStart.getTime())) {
      errors.push("startDate must be a valid date");
    }
  }

  if (end !== undefined) {
    parsedEnd = new Date(end);
    if (isNaN(parsedEnd.getTime())) {
      errors.push("endDate must be a valid date");
    }
  }

  if (
    parsedStart &&
    parsedEnd &&
    !isNaN(parsedStart.getTime()) &&
    !isNaN(parsedEnd.getTime())
  ) {
    if (parsedStart > parsedEnd) {
      errors.push("startDate must not be after endDate");
    }
  }

  if (category !== undefined && !COMPLAINT_CATEGORIES.includes(category)) {
    errors.push(`category must be one of: ${COMPLAINT_CATEGORIES.join(", ")}`);
  }

  if (status !== undefined && !COMPLAINT_STATUSES.includes(status)) {
    errors.push(`status must be one of: ${COMPLAINT_STATUSES.join(", ")}`);
  }

  if (priority !== undefined && !COMPLAINT_PRIORITIES.includes(priority)) {
    errors.push(`priority must be one of: ${COMPLAINT_PRIORITIES.join(", ")}`);
  }

  if (hostel !== undefined && (typeof hostel !== "string" || hostel.length > 100)) {
    errors.push("hostel must not exceed 100 characters");
  }

  const studentTarget = studentId || student;
  if (studentTarget !== undefined && !mongoose.isValidObjectId(studentTarget)) {
    errors.push("student must be a valid ObjectId");
  }

  if (errors.length) {
    throw new ApiError(400, errors.join("; "), errors);
  }

  next();
};


