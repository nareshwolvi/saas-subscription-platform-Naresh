
import "dotenv/config";
import { Redis } from "ioredis";

const redisHost = process.env.REDIS_HOST || "localhost";
const redisPort = Number(process.env.REDIS_PORT || 6379);
const redisPassword = process.env.REDIS_PASSWORD || undefined;

export const redisConnection = new Redis({
  host: redisHost,
  port: redisPort,
  password: redisPassword,
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

redisConnection.on("connect", () => {
  console.log("Redis connected");
});

redisConnection.on("error", (error: Error) => {
  console.error("Redis connection error:", error.message);
});
