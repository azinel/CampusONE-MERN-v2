import Notification, { NOTIFICATION_TYPES } from "../models/Notification.js";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const formatNotification = (notification) => ({
  id: notification._id,
  userId: notification.recipient?.toString?.() || notification.recipient,
  title: notification.title,
  message: notification.message,
  type: notification.type,
  read: Boolean(notification.read),
  link: notification.link || "",
  createdAt: notification.createdAt,
  updatedAt: notification.updatedAt,
});

export const listNotifications = asyncHandler(async (req, res) => {
  const { unreadOnly } = req.query;
  const filter = { recipient: req.user._id };

  if (unreadOnly === "true" || unreadOnly === true) {
    filter.read = false;
  }

  const notifications = await Notification.find(filter).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        notifications.map(formatNotification),
        "Notifications fetched successfully"
      )
    );
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id,
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (!notification.read) {
    notification.read = true;
    await notification.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, formatNotification(notification), "Notification marked as read"));
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { recipient: req.user._id, read: false },
    { $set: { read: true } }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      { modifiedCount: result.modifiedCount },
      "All notifications marked as read"
    )
  );
});

export const createNotification = asyncHandler(async (req, res) => {
  const {
    title,
    message,
    type = "general",
    link = "",
    recipientId,
    userId,
    recipientIds,
    role,
  } = req.body;

  if (!title?.trim() || !message?.trim()) {
    throw new ApiError(400, "title and message are required");
  }

  if (type && !NOTIFICATION_TYPES.includes(type)) {
    throw new ApiError(400, `type must be one of: ${NOTIFICATION_TYPES.join(", ")}`);
  }

  let recipients = [];

  if (Array.isArray(recipientIds) && recipientIds.length) {
    recipients = recipientIds;
  } else if (recipientId || userId) {
    recipients = [recipientId || userId];
  } else if (role) {
    if (!["student", "admin"].includes(role)) {
      throw new ApiError(400, "role must be student or admin");
    }
    const users = await User.find({ role }).select("_id");
    recipients = users.map((u) => u._id);
  } else {
    throw new ApiError(400, "recipientId, recipientIds, or role is required");
  }

  if (!recipients.length) {
    throw new ApiError(404, "No recipients found");
  }

  const docs = recipients.map((recipient) => ({
    recipient,
    title: title.trim(),
    message: message.trim(),
    type: type || "general",
    link: link?.trim?.() || "",
    read: false,
  }));

  const created = await Notification.insertMany(docs);

  return res.status(201).json(
    new ApiResponse(
      201,
      created.map(formatNotification),
      created.length === 1
        ? "Notification created successfully"
        : "Notifications created successfully"
    )
  );
});
