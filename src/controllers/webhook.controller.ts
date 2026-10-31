import type { Request, Response } from "express";
import crypto from "node:crypto";
import { prisma } from "../config/database.js";
import { processWebhookEvent } from "../services/webhook.service.js";

export async function razorpayWebhookController(
  req: Request,
  res: Response
) {
  try {
    // 1. Validate webhook configuration.
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not configured");

      return res.status(500).json({
        success: false,
        message: "Webhook configuration error",
      });
    }

    // 2. Validate the raw request body.
    // Razorpay signature verification requires the original bytes.
    if (!Buffer.isBuffer(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook body. Expected raw Buffer.",
      });
    }

    const rawBody = req.body as Buffer;

    // 3. Read Razorpay webhook headers.
    const signature = req.get("x-razorpay-signature");
    const eventId = req.get("x-razorpay-event-id");

    if (!signature || !eventId) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay webhook signature or event ID",
      });
    }

    // 4. Generate expected HMAC-SHA256 signature.
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest();

    // Validate hexadecimal signature format.
    if (!/^[a-fA-F0-9]{64}$/.test(signature)) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature format",
      });
    }

    const receivedSignature = Buffer.from(signature, "hex");

    // Use timing-safe comparison to prevent timing attacks.
    if (
      receivedSignature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(expectedSignature, receivedSignature)
    ) {
      console.warn("Razorpay webhook signature verification failed");

      return res.status(400).json({
        success: false,
        message: "Webhook signature verification failed",
      });
    }

    // 5. Parse JSON only after signature verification.
    let payload: {
      event?: string;
      [key: string]: unknown;
    };

    try {
      payload = JSON.parse(rawBody.toString("utf8"));
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook JSON payload",
      });
    }

    if (
      typeof payload.event !== "string" ||
      payload.event.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing webhook event type",
      });
    }

    const eventType = payload.event;

    console.log("Razorpay webhook received:", {
      eventId,
      eventType,
    });

    // 6. Store the event or retrieve an existing event.
    let existingEvent;

    try {
      existingEvent = await prisma.webhookEvent.create({
        data: {
          razorpayEventId: eventId,
          eventType,
          status: "RECEIVED",
          payload: payload as import("../generated/prisma/client.js").Prisma.InputJsonValue,
        },
      });
    } catch (error: unknown) {
      const isDuplicate =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002";

      if (!isDuplicate) {
        throw error;
      }

      // Retrieve the previously stored event.
      existingEvent = await prisma.webhookEvent.findUnique({
        where: {
          razorpayEventId: eventId,
        },
      });

      if (!existingEvent) {
        throw new Error(
          "Duplicate webhook event could not be retrieved"
        );
      }

      // Already completed: acknowledge without processing again.
      if (existingEvent.status === "PROCESSED") {
        return res.status(200).json({
          success: true,
          message: "Webhook already processed",
        });
      }

      console.log("Retrying existing webhook event:", {
        eventId,
        status: existingEvent.status,
      });
    }

    // 7. Process the stored event.
    // Processing is responsible for updating subscriptions and payments.
    await processWebhookEvent(eventId);

    console.log("Razorpay webhook processed successfully:", {
      eventId,
      eventType,
    });

    // 8. Acknowledge successful processing.
    return res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("Razorpay webhook processing error:", error);

    // Return 500 so Razorpay can retry delivery.
    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
}
