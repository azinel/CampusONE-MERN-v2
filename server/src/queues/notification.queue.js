import { Queue } from "bullmq";
import {
  NOTIFICATION_QUEUE_NAME,
  getQueueConnectionConfig,
  DEFAULT_JOB_OPTIONS,
} from "../config/queue.js";

let notificationQueue = null;

export const getNotificationQueue = () => {
  if (!notificationQueue) {
    try {
      const connection = getQueueConnectionConfig();
      notificationQueue = new Queue(NOTIFICATION_QUEUE_NAME, {
        connection,
        defaultJobOptions: DEFAULT_JOB_OPTIONS,
      });

      notificationQueue.on("error", (err) => {
        if (process.env.NODE_ENV !== "test") {
          console.warn(`[NotificationQueue] Connection notice: ${err.message}`);
        }
      });
    } catch (err) {
      if (process.env.NODE_ENV !== "test") {
        console.warn(`[NotificationQueue] Failed to initialize: ${err.message}`);
      }
      return null;
    }
  }
  return notificationQueue;
};

export const setNotificationQueue = (customQueue) => {
  notificationQueue = customQueue;
};

export const closeNotificationQueue = async () => {
  if (notificationQueue) {
    try {
      if (typeof notificationQueue.close === "function") {
        await notificationQueue.close();
      }
    } catch {
      // ignore
    }
    notificationQueue = null;
  }
};

/**
 * Safely enqueues a notification job.
 * Non-blocking and fails open if Redis or Queue is unavailable.
 */
export async function enqueueNotificationJob(eventType, payload, options = {}) {
  try {
    const queue = getNotificationQueue();
    if (!queue) {
      return null;
    }

    const jobId =
      options.jobId ||
      `${eventType}-${payload.complaintId}-${payload.status || payload.priority || "created"}`;

    const job = await queue.add(eventType, payload, {
      ...DEFAULT_JOB_OPTIONS,
      jobId,
      ...options,
    });

    return job;
  } catch (err) {
    // Fail-open: Redis failure must not break normal complaint API operations
    if (process.env.NODE_ENV !== "test") {
      console.warn(`[NotificationQueue] Enqueue skipped (${eventType}): ${err.message}`);
    }
    return null;
  }
}
