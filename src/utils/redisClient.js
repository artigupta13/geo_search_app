// redisClient.js
import Redis from "ioredis";

// Create Redis client
const redis = new Redis();

// Set maximum dynamically 1GB
redis.config("set", "maxmemory", "1GB", (err, res) => {
  if (err) {
    console.log("Error setting maxmemory:", err);
  } else {
    console.log("Maxmemory set successfully:", res);
  }
});

redis.config("set", "maxmemory-policy", "volatile-lru", (err, res) => {
  if (err) {
    console.error("Error setting maxmemory-policy:", err);
  } else {
    console.log("Maxmemory-policy set successfully:", res);
  }
});

// Handle connection errors
redis.on("error", (err) => {
  console.error("Redis client error:", err);
});

const closeRedis = async () => {
  await redis.quit();
};

export { redis, closeRedis };
