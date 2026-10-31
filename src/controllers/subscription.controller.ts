import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { createSubscription } from "../services/subscription.service.js";

const createSubscriptionSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
});

export async function createSubscriptionController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const validation = createSubscriptionSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid request data",
        errors: validation.error.issues,
      });
      return;
    }

    const result = await createSubscription(validation.data);

    res.status(201).json({
      success: true,
      message: "Subscription created successfully. Complete the authorization payment.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
