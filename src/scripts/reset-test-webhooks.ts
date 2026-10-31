import { prisma } from "../config/database.js";

const testEventIds = [
  "TuBCYQ9DoxyskW",
  "TuBCSg4W3maztY",
  "TuBCZeerRnJafo",
];

async function resetTestWebhooks() {
  try {
    const result = await prisma.webhookEvent.updateMany({
      where: {
        razorpayEventId: {
          in: testEventIds,
        },
        status: "PROCESSED",
      },
      data: {
        status: "RECEIVED",
        processedAt: null,
        error: null,
      },
    });

    console.log(`Reset ${result.count} test webhook events.`);
  } catch (error) {
    console.error("Failed to reset webhook events:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

resetTestWebhooks();
