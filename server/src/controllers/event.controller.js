import Event from "../models/Event.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { EVENT_CATEGORIES } from "../constants/index.js";

const splitDateTime = (value) => {
  if (!value) return { date: "", time: "" };
  const normalized = String(value).trim().replace(" ", "T");
  const [datePart, timePart = "00:00"] = normalized.split("T");
  return {
    date: datePart,
    time: timePart.slice(0, 5),
  };
};

const toDateTime = (date, time) => {
  if (!date) return null;
  const normalizedTime = (time || "00:00").slice(0, 5);
  const parsed = new Date(`${date}T${normalizedTime}:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const resolveSchedule = ({ date, time, startDate, endDate }) => {
  let resolvedDate = date;
  let resolvedTime = time;

  if (startDate) {
    const parts = splitDateTime(startDate);
    resolvedDate = parts.date || resolvedDate;
    resolvedTime = parts.time || resolvedTime;
  }

  if (!resolvedDate || !resolvedTime) {
    throw new ApiError(400, "date and time (or startDate) are required");
  }

  const startsAt = toDateTime(resolvedDate, resolvedTime);
  if (!startsAt) {
    throw new ApiError(400, "Invalid date/time");
  }

  let endsAt = null;
  if (endDate) {
    const endParts = splitDateTime(endDate);
    endsAt = toDateTime(endParts.date, endParts.time);
    if (!endsAt) {
      throw new ApiError(400, "Invalid endDate");
    }
  }

  return {
    date: resolvedDate,
    time: resolvedTime,
    startsAt,
    endsAt,
  };
};

const formatEvent = (event) => {
  const startIso = event.startsAt
    ? new Date(event.startsAt).toISOString()
    : toDateTime(event.date, event.time)?.toISOString();

  return {
    id: event._id,
    title: event.title,
    description: event.description,
    date: event.date,
    time: event.time,
    venue: event.venue,
    location: event.venue,
    organizer: event.organizer,
    category: event.category,
    image: event.image || null,
    banner: event.image || null,
    startDate: startIso,
    endDate: event.endsAt ? new Date(event.endsAt).toISOString() : startIso,
    maxCapacity: event.maxCapacity ?? 100,
    registeredCount: event.registeredCount ?? 0,
    status: "published",
    createdBy: event.createdBy?.toString?.() || event.createdBy,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
};

const resolveImage = async (req) => {
  if (req.file) {
    const uploaded = await uploadOnCloudinary(req.file.path);
    return uploaded?.secure_url || uploaded?.url || null;
  }

  const imageUrl = req.body.image || req.body.banner;
  if (typeof imageUrl === "string" && imageUrl.startsWith("http")) {
    return imageUrl;
  }

  return undefined;
};

export const listEvents = asyncHandler(async (req, res) => {
  const { upcoming, past, category, search } = req.query;
  const filter = {};

  const now = new Date();

  if (upcoming === "true" || upcoming === true) {
    filter.startsAt = { ...(filter.startsAt || {}), $gte: now };
  }

  if (past === "true" || past === true) {
    filter.startsAt = { ...(filter.startsAt || {}), $lt: now };
  }

  if (category) {
    if (!EVENT_CATEGORIES.includes(category)) {
      throw new ApiError(400, `category must be one of: ${EVENT_CATEGORIES.join(", ")}`);
    }
    filter.category = category;
  }

  if (search) {
    const q = String(search).trim();
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { venue: { $regex: q, $options: "i" } },
      { organizer: { $regex: q, $options: "i" } },
    ];
  }

  const sort = past === "true" || past === true ? { startsAt: -1 } : { startsAt: 1 };
  const events = await Event.find(filter).sort(sort);

  return res
    .status(200)
    .json(new ApiResponse(200, events.map(formatEvent), "Events fetched successfully"));
});

export const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, formatEvent(event), "Event fetched successfully"));
});

export const createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    organizer,
    maxCapacity,
    date,
    time,
    startDate,
    endDate,
  } = req.body;

  const venue = req.body.venue || req.body.location;

  if (!title || !description || !category || !organizer || !venue) {
    throw new ApiError(400, "title, description, category, organizer, and venue are required");
  }

  if (!EVENT_CATEGORIES.includes(category)) {
    throw new ApiError(400, `category must be one of: ${EVENT_CATEGORIES.join(", ")}`);
  }

  const schedule = resolveSchedule({ date, time, startDate, endDate });
  const image = (await resolveImage(req)) || null;

  const capacity = Number(maxCapacity);
  if (!Number.isFinite(capacity) || capacity < 1) {
    throw new ApiError(400, "maxCapacity must be at least 1");
  }

  const event = await Event.create({
    title: title.trim(),
    description: description.trim(),
    category,
    organizer: organizer.trim(),
    venue: venue.trim(),
    date: schedule.date,
    time: schedule.time,
    startsAt: schedule.startsAt,
    endsAt: schedule.endsAt,
    image,
    maxCapacity: capacity,
    registeredCount: 0,
    createdBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, formatEvent(event), "Event created successfully"));
});

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  const {
    title,
    description,
    category,
    organizer,
    maxCapacity,
    date,
    time,
    startDate,
    endDate,
  } = req.body;

  const venue = req.body.venue || req.body.location;

  if (title !== undefined) event.title = String(title).trim();
  if (description !== undefined) event.description = String(description).trim();
  if (organizer !== undefined) event.organizer = String(organizer).trim();
  if (venue !== undefined) event.venue = String(venue).trim();

  if (category !== undefined) {
    if (!EVENT_CATEGORIES.includes(category)) {
      throw new ApiError(400, `category must be one of: ${EVENT_CATEGORIES.join(", ")}`);
    }
    event.category = category;
  }

  if (maxCapacity !== undefined) {
    const capacity = Number(maxCapacity);
    if (!Number.isFinite(capacity) || capacity < 1) {
      throw new ApiError(400, "maxCapacity must be at least 1");
    }
    if (capacity < event.registeredCount) {
      throw new ApiError(400, "maxCapacity cannot be less than current registrations");
    }
    event.maxCapacity = capacity;
  }

  if (date || time || startDate || endDate) {
    const schedule = resolveSchedule({
      date: date || event.date,
      time: time || event.time,
      startDate,
      endDate: endDate || undefined,
    });
    event.date = schedule.date;
    event.time = schedule.time;
    event.startsAt = schedule.startsAt;
    if (endDate !== undefined) {
      event.endsAt = schedule.endsAt;
    }
  }

  const image = await resolveImage(req);
  if (image !== undefined) {
    event.image = image;
  }

  await event.save();

  return res
    .status(200)
    .json(new ApiResponse(200, formatEvent(event), "Event updated successfully"));
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { id: event._id }, "Event deleted successfully"));
});

export const registerForEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  if (event.startsAt < new Date()) {
    throw new ApiError(400, "Cannot register for a past event");
  }

  if (event.registeredCount >= event.maxCapacity) {
    throw new ApiError(400, "Event is full");
  }

  const userId = req.user._id.toString();
  const alreadyRegistered = event.registeredUsers.some(
    (id) => id.toString() === userId
  );

  if (alreadyRegistered) {
    throw new ApiError(409, "You are already registered for this event");
  }

  event.registeredUsers.push(req.user._id);
  event.registeredCount += 1;
  await event.save();

  return res
    .status(200)
    .json(new ApiResponse(200, formatEvent(event), "Registered successfully"));
});
