import "dotenv/config";
import { razorpay } from "../config/razorpay.js";

async function checkRazorpay() {
  try {
    console.log("Checking Razorpay API connection...");

    const planId = process.env.RAZORPAY_PLAN_STARTER_MONTHLY;

    if (!planId) {
      throw new Error("RAZORPAY_PLAN_STARTER_MONTHLY is missing");
    }

    const plan = await razorpay.plans.fetch(planId);

    console.log("Razorpay API connection successful!");
    console.log("Plan details:");
    console.log({
      id: plan.id,
      period: plan.period,
      interval: plan.interval,
      item: plan.item,
    });
  } catch (error) {
    console.error("Razorpay connection failed:", error);
    process.exitCode = 1;
  }
}

checkRazorpay();
