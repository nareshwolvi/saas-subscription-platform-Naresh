import { prisma } from "../config/database.js";
import { redisConnection } from "../config/redis.js";

const ANALYTICS_CACHE_KEY = "analytics:subscription-metrics";
const CACHE_TTL_SECONDS = 60;

export interface SubscriptionAnalytics {
  activeSubscribers: number;
  totalSubscriptions: number;
  totalRevenue: {
    currency: string;
    amount: number;
  }[];
  monthlyRevenue: {
    currency: string;
    amount: number;
  }[];
  generatedAt: string;
}

export async function getSubscriptionAnalytics(): Promise<SubscriptionAnalytics> {
  // 1. Check Redis cache first.
  const cachedData = await redisConnection.get(ANALYTICS_CACHE_KEY);

  if (cachedData) {
    console.log("Analytics served from Redis cache");
    return JSON.parse(cachedData) as SubscriptionAnalytics;
  }

  console.log("Analytics cache miss. Querying PostgreSQL...");

  // 2. Calculate active subscribers.
  const activeSubscribers = await prisma.subscription.count({
    where: {
      status: "ACTIVE",
    },
  });

  // 3. Calculate total subscriptions.
  const totalSubscriptions = await prisma.subscription.count();

  // 4. Calculate successful revenue, grouped by currency.
  // Amounts are stored in the smallest currency unit (paise for INR).
  const totalRevenueGroups = await prisma.payment.groupBy({
    by: ["currency"],
    where: {
      status: "SUCCEEDED",
    },
    _sum: {
      amount: true,
    },
  });

  // 5. Calculate current calendar month's revenue.
  const now = new Date();
  const monthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  const monthlyRevenueGroups = await prisma.payment.groupBy({
    by: ["currency"],
    where: {
      status: "SUCCEEDED",
      createdAt: {
        gte: monthStart,
        lte: now,
      },
    },
    _sum: {
      amount: true,
    },
  });

  const analytics: SubscriptionAnalytics = {
    activeSubscribers,
    totalSubscriptions,

    totalRevenue: totalRevenueGroups.map((group) => ({
      currency: group.currency.toUpperCase(),
      amount: group._sum.amount ?? 0,
    })),

    monthlyRevenue: monthlyRevenueGroups.map((group) => ({
      currency: group.currency.toUpperCase(),
      amount: group._sum.amount ?? 0,
    })),

    generatedAt: now.toISOString(),
  };

  // 6. Store results in Redis for 60 seconds.
  await redisConnection.set(
    ANALYTICS_CACHE_KEY,
    JSON.stringify(analytics),
    "EX",
    CACHE_TTL_SECONDS
  );

  console.log("Analytics cached in Redis");

  return analytics;
}

export async function invalidateAnalyticsCache(): Promise<void> {
  await redisConnection.del(ANALYTICS_CACHE_KEY);
  console.log("Analytics Redis cache invalidated");
}
