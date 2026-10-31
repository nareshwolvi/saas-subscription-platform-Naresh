
import { prisma } from "../config/database.js";
import type { Prisma } from "../generated/prisma/client.js";

import { fulfillSuccessfulPayment } from "./payment-fulfillment.service.js";
import { invalidateAnalyticsCache } from "./analytics.service.js";

type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonObject;
  }

  return {};
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0
    ? value
    : undefined;
}

function asNumber(value: unknown): number | undefined {
  const number = Number(value);

  return Number.isSafeInteger(number) && number >= 0
    ? number
    : undefined;
}

function unixDate(value: unknown): Date | undefined {
  const seconds = asNumber(value);

  return seconds !== undefined && seconds > 0
    ? new Date(seconds * 1000)
    : undefined;
}

export async function processWebhookEvent(eventId: string) {
  // Local database payment ID used after transaction commit.
  let fulfillmentPaymentId: string | undefined;

  // Tracks whether subscription/payment metrics changed.
  let shouldInvalidateAnalytics = false;

  try {
    await prisma.$transaction(async (tx) => {
      const event = await tx.webhookEvent.findUnique({
        where: {
          razorpayEventId: eventId,
        },
      });

      if (!event || event.status === "PROCESSED") {
        return;
      }

      await tx.webhookEvent.update({
        where: {
          id: event.id,
        },
        data: {
          status: "PROCESSING",
          error: null,
        },
      });

      // Razorpay wraps the actual entities inside payload.payload.
      const root = asObject(event.payload);
      const eventData = asObject(root.payload);

      const subscriptionEntity = asObject(
        asObject(eventData.subscription).entity
      );

      const paymentEntity = asObject(
        asObject(eventData.payment).entity
      );

      const invoiceEntity = asObject(
        asObject(eventData.invoice).entity
      );

      const subscriptionId =
        asString(subscriptionEntity.id) ??
        asString(invoiceEntity.subscription_id) ??
        asString(paymentEntity.subscription_id);

      const razorpayPaymentId =
        asString(paymentEntity.id) ??
        asString(invoiceEntity.payment_id);

      const knownEvents = [
        "subscription.activated",
        "subscription.charged",
        "subscription.cancelled",
        "subscription.halted",
        "subscription.completed",
        "subscription.expired",
        "invoice.paid",
        "payment.failed",
      ];

      const isKnownEvent = knownEvents.includes(event.eventType);

      if (!isKnownEvent) {
        console.log(
          `Ignoring unsupported Razorpay event: ${event.eventType}`
        );

        await tx.webhookEvent.update({
          where: {
            id: event.id,
          },
          data: {
            status: "PROCESSED",
            processedAt: new Date(),
            error: null,
          },
        });

        return;
      }

      if (!subscriptionId) {
        throw new Error(
          `Missing subscription ID in ${event.eventType} event`
        );
      }

      const subscription = await tx.subscription.findUnique({
        where: {
          razorpaySubscriptionId: subscriptionId,
        },
        include: {
          plan: true,
        },
      });

      if (!subscription) {
        throw new Error(
          `Local subscription not found: ${subscriptionId}`
        );
      }

      const statusByEvent = {
        "subscription.activated": "ACTIVE",
        "subscription.charged": "ACTIVE",
        "invoice.paid": "ACTIVE",
        "subscription.cancelled": "CANCELED",
        "subscription.halted": "UNPAID",
        "subscription.completed": "EXPIRED",
        "subscription.expired": "EXPIRED",
      } as const;

      const nextStatus =
        statusByEvent[
          event.eventType as keyof typeof statusByEvent
        ];

      const currentStart = unixDate(
        subscriptionEntity.current_start
      );

      const currentEnd = unixDate(
        subscriptionEntity.current_end
      );

      const endedAt = unixDate(
        subscriptionEntity.ended_at
      );

      // Update subscription status and billing period.
      await tx.subscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          ...(nextStatus ? { status: nextStatus } : {}),
          ...(currentStart
            ? { currentPeriodStart: currentStart }
            : {}),
          ...(currentEnd
            ? { currentPeriodEnd: currentEnd }
            : {}),
          ...(endedAt
            ? { endedAt, canceledAt: endedAt }
            : {}),
        },
      });

      // Subscription analytics may have changed.
      shouldInvalidateAnalytics = true;

      const isSuccessfulPayment = [
        "subscription.charged",
        "invoice.paid",
      ].includes(event.eventType);

      const isFailedPayment =
        event.eventType === "payment.failed";

      if (isFailedPayment) {
        await tx.subscription.update({
          where: {
            id: subscription.id,
          },
          data: {
            status: "PAST_DUE",
          },
        });
      }

      if (isSuccessfulPayment || isFailedPayment) {
        if (!razorpayPaymentId) {
          throw new Error(
            `Missing Razorpay payment ID in ${event.eventType} event`
          );
        }

        const amount =
          asNumber(paymentEntity.amount) ??
          asNumber(invoiceEntity.amount_paid) ??
          asNumber(invoiceEntity.amount);

        if (amount === undefined || amount <= 0) {
          throw new Error(
            `Invalid payment amount for ${razorpayPaymentId}`
          );
        }

        const currency = (
          asString(paymentEntity.currency) ??
          asString(invoiceEntity.currency) ??
          subscription.plan.currency
        ).toLowerCase();

        const paymentData = {
          userId: subscription.userId,
          subscriptionId: subscription.id,
          amount,
          currency,
          status: isSuccessfulPayment
            ? ("SUCCEEDED" as const)
            : ("FAILED" as const),
          paymentMethod:
            asString(paymentEntity.method) ?? null,
          metadata: {
            eventType: event.eventType,
            invoiceId: asString(invoiceEntity.id) ?? null,
            razorpaySubscriptionId: subscriptionId,
          } satisfies Prisma.InputJsonObject,
        };

        // Both invoice.paid and subscription.charged may refer
        // to the same payment. The unique Razorpay payment ID
        // prevents duplicate local payment records.
        const payment = await tx.payment.upsert({
          where: {
            razorpayPaymentId,
          },
          create: {
            ...paymentData,
            razorpayPaymentId,
          },
          update: paymentData,
        });

        // Save local payment ID for post-transaction fulfillment.
        if (isSuccessfulPayment) {
          fulfillmentPaymentId = payment.id;
        }

        // Revenue analytics may have changed.
        shouldInvalidateAnalytics = true;
      }

      // Mark event processed only after database operations succeed.
      await tx.webhookEvent.update({
        where: {
          id: event.id,
        },
        data: {
          status: "PROCESSED",
          processedAt: new Date(),
          error: null,
        },
      });
    });

    // The database transaction has committed successfully here.

    // Clear cached analytics after subscription/payment changes.
    if (shouldInvalidateAnalytics) {
      await invalidateAnalyticsCache();
    }

    // Generate invoice and send email only for successful payments.
    if (fulfillmentPaymentId) {
      await fulfillSuccessfulPayment(fulfillmentPaymentId);
    }

  } catch (error) {
    await prisma.webhookEvent.update({
      where: {
        razorpayEventId: eventId,
      },
      data: {
        status: "FAILED",
        error:
          error instanceof Error
            ? error.message
            : "Unknown webhook processing error",
      },
    }).catch((updateError) => {
      console.error(
        "Could not update webhook failure status:",
        updateError
      );
    });

    console.error(
      `Webhook processing failed: ${eventId}`,
      error
    );

    throw error;
  }
}
