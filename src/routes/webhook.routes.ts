import express, { Router } from "express";
import { razorpayWebhookController } from "../controllers/webhook.controller.js";

const router = Router();

router.post(
  "/",
  express.raw({ type: "application/json", limit: "1mb" }),
  razorpayWebhookController
);

export default router;
