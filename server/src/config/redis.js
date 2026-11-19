import Redis from "ioredis";

let redisClient = null;
let isConnected = false;

export const createRedisClient = (
  redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379"
) => {
  const client = new Redis(redisUrl, {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
    retryStrategy: (times) => {
      // Retry up to 3 times, then stop to prevent continuous reconnect attempts
      if (times > 3) return null;
      return Math.min(times * 200, 1000);
    },
  });

  client.on("connect", () => {
    isConnected = true;
  });

  client.on("ready", () => {
    isConnected = true;
  });

  client.on("close", () => {
    isConnected = false;
  });

  client.on("end", () => {
    isConnected = false;
  });

  client.on("error", (err) => {
    isConnected = false;
    if (process.env.NODE_ENV !== "test") {
      console.warn(`Redis notice: ${err.message}`);
    }
  });

  return client;
};

export const getRedisClient = () => {
  if (!redisClient) {
    redisClient = createRedisClient();
    // Attempt lazy connection in background without blocking API execution
    redisClient.connect?.().catch?.(() => {
      // Gracefully fail-open if Redis is not running
    });
  }
  return redisClient;
};

export const setRedisClient = (customClient) => {
  if (
    redisClient &&
    redisClient !== customClient &&
    typeof redisClient.disconnect === "function"
  ) {
    try {
      redisClient.disconnect();
    } catch {
      // ignore
    }
  }
  redisClient = customClient;
  isConnected = customClient ? customClient.status === "ready" : false;
};

export const isRedisReady = () => {
  if (!redisClient) return false;
  return redisClient.status === "ready" || isConnected;
};

export const closeRedisConnection = async () => {
  if (redisClient) {
    try {
      if (typeof redisClient.quit === "function") {
        await redisClient.quit();
      } else if (typeof redisClient.disconnect === "function") {
        redisClient.disconnect();
      }
    } catch {
      // ignore
    }
    redisClient = null;
    isConnected = false;
  }
};
