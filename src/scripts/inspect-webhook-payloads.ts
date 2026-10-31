
import { prisma } from "../config/database.js";

function object(value: unknown): Record<string, any> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, any>;
  }
  return {};
}

async function inspectWebhookPayloads() {
  try {
    const events = await prisma.webhookEvent.findMany({
      orderBy: { receivedAt: "asc" },
      take: 20,
    });

    for (const event of events) {
      const payload = object(event.payload);
      const eventData = object(payload.payload);

      const subscription = object(eventData.subscription);
      const subscriptionEntity = object(subscription.entity);

      const payment = object(eventData.payment);
      const paymentEntity = object(payment.entity);

      const invoice = object(eventData.invoice);
      const invoiceEntity = object(invoice.entity);

      console.log("\n================================");
      console.log("EVENT:", event.eventType);
      console.log("EVENT ID:", event.razorpayEventId);

      console.log("TOP LEVEL KEYS:", Object.keys(payload));
      console.log("INNER PAYLOAD KEYS:", Object.keys(eventData));

      console.log("SUBSCRIPTION:", {
        keys: Object.keys(subscription),
        entityId: subscriptionEntity.id,
        entityStatus: subscriptionEntity.status,
        currentStart: subscriptionEntity.current_start,
        currentEnd: subscriptionEntity.current_end,
      });

      console.log("PAYMENT:", {
        keys: Object.keys(payment),
        entityId: paymentEntity.id,
        subscriptionId: paymentEntity.subscription_id,
        invoiceId: paymentEntity.invoice_id,
        amount: paymentEntity.amount,
        currency: paymentEntity.currency,
        status: paymentEntity.status,
      });

      console.log("INVOICE:", {
        keys: Object.keys(invoice),
        entityId: invoiceEntity.id,
        subscriptionId: invoiceEntity.subscription_id,
        paymentId: invoiceEntity.payment_id,
        amountPaid: invoiceEntity.amount_paid,
        amount: invoiceEntity.amount,
        currency: invoiceEntity.currency,
      });
    }

    console.log("\nLOCAL SUBSCRIPTIONS:");

    const subscriptions = await prisma.subscription.findMany({
      select: {
        id: true,
        razorpaySubscriptionId: true,
        status: true,
      },
    });

    console.table(subscriptions);
  } catch (error) {
    console.error("Payload inspection failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

inspectWebhookPayloads();
