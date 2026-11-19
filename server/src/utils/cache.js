import { getRedisClient } from "../config/redis.js";

export const CACHE_TTL = {
  ANALYTICS: 300,        // 5 minutes
  COMPLAINT_LIST: 60,    // 1 minute
  COMPLAINT_DETAIL: 120, // 2 minutes
};

export const CACHE_PREFIX = {
  ANALYTICS: "campusone:complaints:analytics",
  LIST: "campusone:complaints:list",
  DETAIL: "campusone:complaints:detail",
};

/**
 * Normalizes query object into a deterministic sorted string
 */
export const normalizeQueryKey = (query = {}) => {
  const sortedKeys = Object.keys(query).sort();
  const pairs = [];
  for (const k of sortedKeys) {
    const val = query[k];
    if (val !== undefined && val !== null && val !== "") {
      pairs.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(val).trim())}`);
    }
  }
  return pairs.length > 0 ? pairs.join("&") : "all";
};

/**
 * Builds analytics cache key
 */
export const buildAnalyticsCacheKey = (query = {}) => {
  return `${CACHE_PREFIX.ANALYTICS}:${normalizeQueryKey(query)}`;
};

/**
 * Builds complaints list cache key with user scoping (prevents cross-user data leaks)
 */
export const buildComplaintListCacheKey = (user, query = {}) => {
  const scope =
    user?.role === "student"
      ? `student:${user._id?.toString?.() || user.id}`
      : "admin";
  return `${CACHE_PREFIX.LIST}:${scope}:${normalizeQueryKey(query)}`;
};

/**
 * Builds complaint detail cache key
 */
export const buildComplaintDetailCacheKey = (complaintId) => {
  return `${CACHE_PREFIX.DETAIL}:${complaintId}`;
};

/**
 * Safely fetches an item from cache. Returns null on miss or Redis failure.
 */
export async function getCache(key) {
  try {
    const client = getRedisClient();
    if (!client) return null;
    const data = await client.get(key);
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    // Fail-open: return null so DB is queried normally
    return null;
  }
}

/**
 * Safely sets an item in cache with TTL. Fails silently on Redis failure.
 */
export async function setCache(key, value, ttlSeconds = 60) {
  try {
    const client = getRedisClient();
    if (!client) return false;
    const serialized = JSON.stringify(value);
    await client.set(key, serialized, "EX", ttlSeconds);
    return true;
  } catch {
    // Fail-open: ignore write failure
    return false;
  }
}

/**
 * Deletes a specific cache key.
 */
export async function delCache(key) {
  try {
    const client = getRedisClient();
    if (!client) return 0;
    return await client.del(key);
  } catch {
    return 0;
  }
}

/**
 * Scans and invalidates all keys matching a pattern.
 */
export async function invalidateCachePattern(pattern) {
  try {
    const client = getRedisClient();
    if (!client) return 0;

    let cursor = "0";
    let totalDeleted = 0;

    do {
      const [nextCursor, keys] = await client.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100
      );
      cursor = nextCursor;
      if (keys && keys.length > 0) {
        await client.del(...keys);
        totalDeleted += keys.length;
      }
    } while (cursor !== "0");

    return totalDeleted;
  } catch {
    return 0;
  }
}

/**
 * Invalidate affected cache entries when a complaint is created, updated, or deleted
 */
export async function invalidateComplaintCaches({ complaintId = null } = {}) {
  // Invalidate all analytics aggregations
  await invalidateCachePattern(`${CACHE_PREFIX.ANALYTICS}:*`);
  // Invalidate all complaint listings (both student and admin)
  await invalidateCachePattern(`${CACHE_PREFIX.LIST}:*`);
  // Invalidate complaint detail if a specific ID is provided
  if (complaintId) {
    await delCache(buildComplaintDetailCacheKey(complaintId));
  }
}
