import "dotenv/config";
import { reminderWorker } from "./reminder.worker.js";
import { redisConnection } from "../config/redis.js";

console.log("Starting subscription reminder worker...");

async function shutdown() {
  console.log("Shutting down reminder worker...");

  await reminderWorker.close();
  await redisConnection.quit();

  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});