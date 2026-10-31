import { redisConnection } from "../config/redis.js";
import { reminderQueue } from "../queues/reminder.queue.js";

async function testRedisQueue() {
  try {
    const pong = await redisConnection.ping();

    console.log("Redis ping:", pong);

    const job = await reminderQueue.add(
      "test-reminder",
      {
        subscriptionId: "test-subscription",
        userId: "test-user",
        email: "test@example.com",
        customerName: "Test Customer",
        planName: "Starter Monthly",
        amount: 49900,
        currency: "inr",
        expiresAt: new Date().toISOString(),
      },
      {
        jobId: "redis-queue-connection-test",
      }
    );

    console.log("BullMQ job added:", {
      id: job.id,
      name: job.name,
      queue: "subscription-reminders",
    });

    console.log("Redis and BullMQ connection successful!");
  } catch (error) {
    console.error("Redis queue test failed:", error);
    process.exitCode = 1;
  } finally {
    await reminderQueue.close();
    await redisConnection.quit();
  }
}

testRedisQueue();