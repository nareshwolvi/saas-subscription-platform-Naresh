import { prisma } from "../config/database.js";
import { razorpay } from "../config/razorpay.js";

type CreateSubscriptionInput = {
  name: string;
  email: string;
};

export async function createSubscription(
  input: CreateSubscriptionInput
) {
  const planId = process.env.RAZORPAY_PLAN_STARTER_MONTHLY;

  if (!planId) {
    throw new Error("RAZORPAY_PLAN_STARTER_MONTHLY is not configured");
  }

  // Fetch the actual plan from Razorpay.
  const razorpayPlan = await razorpay.plans.fetch(planId);

  const amountPaise = Number(razorpayPlan.item.amount);

  if (!Number.isSafeInteger(amountPaise) || amountPaise <= 0) {
    throw new Error("Invalid Razorpay plan amount");
  }

  if (!razorpayPlan.item.active) {
    throw new Error("The Razorpay subscription plan is inactive");
  }

  // Create or find the customer.
  const user = await prisma.user.upsert({
    where: {
      email: input.email.toLowerCase(),
    },
    update: {
      name: input.name,
    },
    create: {
      name: input.name,
      email: input.email.toLowerCase(),
    },
  });

  // Create or find the corresponding local plan.
  const plan = await prisma.plan.upsert({
    where: {
      razorpayPlanId: planId,
    },
    update: {
      name: razorpayPlan.item.name,
      priceAmount: amountPaise,
      currency: razorpayPlan.item.currency.toLowerCase(),
      interval: "MONTH",
      intervalCount: razorpayPlan.interval,
      isActive: razorpayPlan.item.active,
    },
    create: {
      name: razorpayPlan.item.name,
      description: razorpayPlan.item.description ?? "SaaS subscription",
      priceAmount: amountPaise,
      currency: razorpayPlan.item.currency.toLowerCase(),
      interval: "MONTH",
      intervalCount: razorpayPlan.interval,
      razorpayPlanId: planId,
    },
  });

  // Create the subscription with Razorpay.
  const razorpaySubscription = await razorpay.subscriptions.create({
    plan_id: planId,
    total_count: 12,
    quantity: 1,
    customer_notify: true,
    notes: {
      userId: user.id,
      planId: plan.id,
      email: user.email,
    },
  });

  // Save the subscription locally as incomplete.
  const subscription = await prisma.subscription.create({
    data: {
      userId: user.id,
      planId: plan.id,
      razorpaySubscriptionId: razorpaySubscription.id,
      status: "INCOMPLETE",
    },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    subscription: {
      id: subscription.id,
      razorpaySubscriptionId: razorpaySubscription.id,
      status: subscription.status,
      shortUrl: razorpaySubscription.short_url,
    },
    checkout: {
      key: process.env.RAZORPAY_KEY_ID,
      subscription_id: razorpaySubscription.id,
      name: "SaaS Subscription Platform",
      description: plan.name,
      amount: plan.priceAmount,
      currency: plan.currency.toUpperCase(),
    },
  };
}
