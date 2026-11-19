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

  client.on("ready", async () => {
    isConnected = true;
    try {
      if (typeof client.ping === "function") {
        const pong = await client.ping();
        if (process.env.NODE_ENV !== "test") {
          console.log(`[Redis] PING successful (${pong}): Redis connection verified`);
        }
      }
    } catch (pingErr) {
      if (process.env.NODE_ENV !== "test") {
        console.error(`[Redis] PING check failed after connection: ${pingErr.message}`);
      }
    }
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
      console.error(`[Redis] Connection failure: ${err.message}`);
    }
  });

  return client;
};

/**
 * Safely executes a Redis PING connectivity check.
 * Logs successful PING or failure and returns boolean indicating connectivity.
 */
export const verifyRedisConnection = async (client = redisClient) => {
  if (!client || typeof client.ping !== "function") {
    return false;
  }
  try {
    const pong = await client.ping();
    if (process.env.NODE_ENV !== "test") {
      console.log(`[Redis] PING successful (${pong}): Redis connection verified`);
    }
    return true;
  } catch (err) {
    if (process.env.NODE_ENV !== "test") {
      console.error(`[Redis] PING check failed: ${err.message}`);
    }
    return false;
  }
};

export const getRedisClient = () => {
  if (!redisClient) {
    redisClient = createRedisClient();
    // Attempt lazy connection in background without blocking API execution or startup
    redisClient.connect?.().catch?.((err) => {
      // Gracefully fail-open if Redis is not running; error listener logs connection failures
      if (process.env.NODE_ENV !== "test" && typeof redisClient?.listenerCount === "function" && redisClient.listenerCount("error") === 0) {
        console.error(`[Redis] Connection failure: ${err.message}`);
      }
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
