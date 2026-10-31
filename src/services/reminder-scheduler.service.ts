import { prisma } from "../config/database.js";
import { reminderQueue } from "../queues/reminder.queue.js";

export async function scheduleUpcomingReminders(daysAhead = 3) {
  const now = new Date();
  const expiryLimit = new Date(
    now.getTime() + daysAhead * 24 * 60 * 60 * 1000
  );

  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      currentPeriodEnd: {
        gte: now,
        lte: expiryLimit,
      },
      cancelAtPeriodEnd: false,
    },
    include: {
      user: true,
      plan: true,
    },
  });

  console.log(
    `Found ${subscriptions.length} subscriptions expiring within ${daysAhead} days.`
  );

  let jobsAdded = 0;

  for (const subscription of subscriptions) {
    const expiry = subscription.currentPeriodEnd;

    if (!expiry) continue;

    const jobId = `subscription-reminder-${subscription.id}-${expiry.getTime()}`;

    const job = await reminderQueue.add(
      "subscription-expiry-reminder",
      {
        subscriptionId: subscription.id,
        userId: subscription.userId,
        email: subscription.user.email,
        customerName: subscription.user.name ?? "Customer",
        planName: subscription.plan.name,
        amount: subscription.plan.priceAmount,
        currency: subscription.plan.currency,
        expiresAt: expiry.toISOString(),
      },
      {
        jobId,
      }
    );

    jobsAdded++;

    console.log("Reminder job scheduled:", {
      jobId: job.id,
      email: subscription.user.email,
      plan: subscription.plan.name,
      expiresAt: expiry.toISOString(),
    });
  }

  return {
    subscriptionsFound: subscriptions.length,
    jobsAdded,
  };
}
