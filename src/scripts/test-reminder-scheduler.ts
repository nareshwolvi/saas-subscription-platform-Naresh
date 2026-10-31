import { scheduleUpcomingReminders } from "../services/reminder-scheduler.service.js";
import { reminderQueue } from "../queues/reminder.queue.js";
import { redisConnection } from "../config/redis.js";
import { prisma } from "../config/database.js";

async function testScheduler() {
  try {
    console.log("Testing subscription reminder scheduler...");

    // Use a large test window so your existing active
    // subscription can be selected.
    const result = await scheduleUpcomingReminders(45);

    console.log("\nScheduler test completed:");
    console.log(result);

    const waitingJobs = await reminderQueue.getWaiting();

    console.log("\nWaiting reminder jobs:");

    for (const job of waitingJobs) {
      console.log({
        id: job.id,
        email: job.data.email,
        subscriptionId: job.data.subscriptionId,
        expiresAt: job.data.expiresAt,
      });
    }
  } catch (error) {
    console.error("Scheduler test failed:", error);
    process.exitCode = 1;
  } finally {
    await reminderQueue.close();
    await redisConnection.quit();
    await prisma.$disconnect();
  }
}

testScheduler();