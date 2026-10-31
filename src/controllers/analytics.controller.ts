import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { getSubscriptionAnalytics } from "../services/analytics.service.js";

export async function getAnalytics(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const analytics = await getSubscriptionAnalytics();

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
}