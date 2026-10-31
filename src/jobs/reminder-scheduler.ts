import "dotenv/config";
import cron from "node-cron";
import { scheduleUpcomingReminders } from "../services/reminder-scheduler.service.js";
import { reminderQueue } from "../queues/reminder.queue.js";
import { redisConnection } from "../config/redis.js";
import { prisma } from "../config/database.js";

console.log("Starting subscription reminder scheduler...");

// Run every day at 9:00 AM.
const task = cron.schedule(
  "0 9 * * *",
  async () => {
    console.log("Running daily subscription reminder check...");

    try {
      const result = await scheduleUpcomingReminders(3);
      console.log("Reminder scheduling completed:", result);
    } catch (error) {
      console.error("Reminder scheduling failed:", error);
    }
  },
  {
    timezone: "Asia/Kolkata",
  }
);

console.log("Reminder scheduler active. Next check: daily at 9:00 AM IST.");

async function shutdown() {
  console.log("Stopping reminder scheduler...");

  task.stop();

  await reminderQueue.close();
  await redisConnection.quit();
  await prisma.$disconnect();

  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});