import { Worker } from "bullmq";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import {
  NOTIFICATION_QUEUE_NAME,
  getQueueConnectionConfig,
} from "../config/queue.js";

let workerInstance = null;

/**
 * Idempotently creates a notification doc if an identical one does not already exist
 */
export async function createNotificationIfNotExists({
  recipient,
  title,
  message,
  type = "complaint",
  link = "",
}) {
  if (!recipient || !title || !message) {
    throw new Error("recipient, title, and message are required for notification");
  }

  const existing = await Notification.findOne({
    recipient,
    title,
    message,
    link,
  });

  if (existing) {
    return { created: false, notification: existing };
  }

  const notification = await Notification.create({
    recipient,
    title,
    message,
    type,
    link,
    read: false,
  });

  return { created: true, notification };
}

/**
 * Core notification processor function
 */
export async function processNotificationJob(job) {
  const eventType = job.name || job.data?.eventType;
  const data = job.data || {};

  if (!data.complaintId) {
    throw new Error("Job missing required complaintId");
  }

  let createdCount = 0;

  switch (eventType) {
    case "complaint.created": {
      // 1. In-app confirmation notification for student
      if (data.studentId) {
        const studentNotif = await createNotificationIfNotExists({
          recipient: data.studentId,
          title: "Complaint submitted",
          message: `Your complaint "${data.title}" has been registered.`,
          type: "complaint",
          link: `/student/complaints/${data.complaintId}`,
        });
        if (studentNotif.created) createdCount++;
      }

      // 2. High priority alert notification for admins
      if (data.priority === "High") {
        const admins = await User.find({ role: "admin" }).select("_id");
        for (const admin of admins) {
          const adminNotif = await createNotificationIfNotExists({
            recipient: admin._id,
            title: "High priority complaint",
            message: `New high priority ${data.category || "general"} complaint: "${data.title}" in ${data.hostel || "hostel"}.`,
            type: "complaint",
            link: `/admin/complaints/${data.complaintId}`,
          });
          if (adminNotif.created) createdCount++;
        }
      }
      break;
    }

    case "complaint.status_updated": {
      if (data.studentId) {
        const noteSuffix = data.note ? ` Note: ${data.note}` : "";
        const statusNotif = await createNotificationIfNotExists({
          recipient: data.studentId,
          title: "Complaint status updated",
          message: `Your complaint "${data.title}" is now ${data.status}.${noteSuffix}`,
          type: "complaint",
          link: `/student/complaints/${data.complaintId}`,
        });
        if (statusNotif.created) createdCount++;
      }
      break;
    }

    case "complaint.priority_updated": {
      if (data.studentId) {
        const priorityNotif = await createNotificationIfNotExists({
          recipient: data.studentId,
          title: "Complaint priority updated",
          message: `Priority for your complaint "${data.title}" has been updated to ${data.priority}.`,
          type: "complaint",
          link: `/student/complaints/${data.complaintId}`,
        });
        if (priorityNotif.created) createdCount++;
      }
      break;
    }

    case "complaint.resolution_updated": {
      if (data.studentId) {
        const resNotif = await createNotificationIfNotExists({
          recipient: data.studentId,
          title: "Complaint resolved",
          message: `Your complaint "${data.title}" has been resolved: ${data.resolution}`,
          type: "complaint",
          link: `/student/complaints/${data.complaintId}`,
        });
        if (resNotif.created) createdCount++;
      }
      break;
    }

    default:
      console.warn(`[NotificationWorker] Unknown eventType: ${eventType}`);
  }

  return {
    processed: true,
    eventType,
    complaintId: data.complaintId,
    notificationsCreated: createdCount,
  };
}

/**
 * Creates and starts the BullMQ worker instance
 */
export function startNotificationWorker() {
  if (workerInstance) {
    return workerInstance;
  }

  try {
    const connection = getQueueConnectionConfig();
    workerInstance = new Worker(NOTIFICATION_QUEUE_NAME, processNotificationJob, {
      connection,
      concurrency: 5,
    });

    workerInstance.on("completed", (job) => {
      if (process.env.NODE_ENV !== "test") {
        console.log(`[NotificationWorker] Job ${job.id} completed: ${job.name}`);
      }
    });

    workerInstance.on("failed", (job, err) => {
      // Safe error logging: failed jobs never crash the process
      console.error(
        `[NotificationWorker] Job ${job?.id || "unknown"} failed (${job?.name}): ${err.message}`
      );
    });

    workerInstance.on("error", (err) => {
      if (process.env.NODE_ENV !== "test") {
        console.warn(`[NotificationWorker] Worker error: ${err.message}`);
      }
    });

    return workerInstance;
  } catch (err) {
    console.error(`[NotificationWorker] Failed to initialize worker: ${err.message}`);
    return null;
  }
}

/**
 * Stops the BullMQ worker instance cleanly
 */
export async function stopNotificationWorker() {
  if (workerInstance) {
    try {
      await workerInstance.close();
    } catch {
      // ignore
    }
    workerInstance = null;
  }
}
