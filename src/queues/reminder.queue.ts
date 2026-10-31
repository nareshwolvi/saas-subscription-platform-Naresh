import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export const REMINDER_QUEUE = "subscription-reminders";

export interface ReminderJobData {
  subscriptionId: string;
  userId: string;
  email: string;
  customerName: string;
  planName: string;
  amount: number;
  currency: string;
  expiresAt: string;
}

export const reminderQueue = new Queue<ReminderJobData>(
  REMINDER_QUEUE,
  {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: 1000,
      removeOnFail: 5000,
    },
  }
);