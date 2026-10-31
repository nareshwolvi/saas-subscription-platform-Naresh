import { Worker } from "bullmq";
import { redisConnection } from "../config/redis.js";
import {
  REMINDER_QUEUE,
  ReminderJobData,
} from "../queues/reminder.queue.js";
import { sendSubscriptionReminderEmail } from "../services/reminder-email.service.js";

export const reminderWorker = new Worker<ReminderJobData>(
  REMINDER_QUEUE,
  async (job) => {
    console.log(`Processing reminder job: ${job.id}`);

    const result = await sendSubscriptionReminderEmail(job.data);

    console.log("Reminder job completed:", {
      jobId: job.id,
      subscriptionId: job.data.subscriptionId,
      recipient: job.data.email,
      previewUrl: result.previewUrl,
    });

    return result;
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

reminderWorker.on("completed", (job) => {
  console.log(`Reminder job ${job.id} completed`);
});

reminderWorker.on("failed", (job, error) => {
  console.error(
    `Reminder job ${job?.id ?? "unknown"} failed:`,
    error.message
  );
});

reminderWorker.on("error", (error) => {
  console.error("Reminder worker error:", error);
});