import { prisma } from "../config/database.js";
import { processWebhookEvent } from "../services/webhook.service.js";

async function reprocessWebhooks() {
  try {
    const events = await prisma.webhookEvent.findMany({
      where: {
        status: {
          in: ["RECEIVED", "FAILED"],
        },
      },
      orderBy: {
        receivedAt: "asc",
      },
      select: {
        razorpayEventId: true,
        eventType: true,
      },
    });

    console.log(`Found ${events.length} events to process`);

    for (const event of events) {
      if (!event.razorpayEventId) continue;

      try {
        await processWebhookEvent(event.razorpayEventId);
        console.log(`Processed: ${event.eventType}`);
      } catch (error) {
        console.error(`Failed: ${event.eventType}`, error);
      }
    }
  } catch (error) {
    console.error("Webhook reprocessing failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

reprocessWebhooks();
