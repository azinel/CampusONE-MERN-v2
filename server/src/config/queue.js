import dotenv from "dotenv";

dotenv.config();

export const NOTIFICATION_QUEUE_NAME = "campusone-notifications";

export const getQueueConnectionConfig = () => {
  const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
  const isTest = process.env.NODE_ENV === "test";
  const baseConfig = {
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    connectTimeout: 2000,
    retryStrategy: (times) => {
      if (isTest && times > 2) return null;
      return Math.min(times * 200, 3000);
    },
  };
  try {
    const parsed = new URL(redisUrl);
    return {
      ...baseConfig,
      host: parsed.hostname || "127.0.0.1",
      port: Number(parsed.port) || 6379,
      password: parsed.password || undefined,
      username: parsed.username || undefined,
      tls: parsed.protocol === "rediss:" ? {} : undefined,
    };
  } catch {
    return {
      ...baseConfig,
      host: "127.0.0.1",
      port: 6379,
    };
  }
};

export const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 1000, // 1s, 2s, 4s
  },
  removeOnComplete: {
    count: 100,
  },
  removeOnFail: {
    count: 200,
  },
};
