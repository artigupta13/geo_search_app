import { redis } from "./redisClient.js";
/**
 * Fetches cached data from Redis.
 * @param {string} key - The cache key.
 * @returns {Promise<any|null>} - The cached data or null if not found.
 */
export const getCachedData = async (key) => {
  // Fetch the serialized JSON string from Redis
  const cachedData = await redis.get(key);
  if (cachedData) {
    console.log(`Returning cached data for key: ${key}`);
  }
  return JSON.parse(cachedData);
};

/**
 * Caches data in Redis.
 * @param {string} key - The cache key.
 * @param {any} data - The data to cache.
 * @param {number} [expiration=3600] - Expiration time in seconds (default is 1 hour).
 * @returns {Promise<void>}
 */
export const setCachedData = async (key, data, expiration = 3600) => {
  try {
    await redis.setex(key, expiration, JSON.stringify(data));
    console.log(`Data saved to Redis for key: ${key}`);
  } catch (error) {
    console.error(`Error saving data to Redis for key ${key}:`, error);
  }
};
