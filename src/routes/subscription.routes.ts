import { Router } from "express";
import { createSubscriptionController } from "../controllers/subscription.controller.js";

const router = Router();

router.post("/", createSubscriptionController);

export default router;
