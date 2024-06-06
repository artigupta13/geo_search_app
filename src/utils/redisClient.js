// redisClient.js
import Redis from "ioredis";

// Create Redis client
const redis = new Redis();

// Handle connection errors
redis.on("error", (err) => {
  console.error("Redis client error:", err);
});

const closeRedis = async () => {
  await redis.quit();
};

export { redis, closeRedis };
