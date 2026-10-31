import { prisma } from "../config/database.js";

async function checkWebhooks() {
  try {
    console.log("Checking Razorpay webhook events...");

    const events = await prisma.webhookEvent.findMany({
      orderBy: {
        receivedAt: "desc",
      },
      take: 20,
      select: {
        id: true,
        razorpayEventId: true,
        eventType: true,
        status: true,
        error: true,
        receivedAt: true,
        processedAt: true,
      },
    });

    if (events.length === 0) {
      console.log("No webhook events found yet.");
      return;
    }

    console.table(events);
  } catch (error) {
    console.error("Failed to fetch webhook events:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

checkWebhooks();
