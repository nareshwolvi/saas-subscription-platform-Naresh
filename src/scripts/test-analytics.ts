import {
  getSubscriptionAnalytics,
  invalidateAnalyticsCache,
} from "../services/analytics.service.js";

import { redisConnection } from "../config/redis.js";
import { prisma } from "../config/database.js";

async function testAnalytics() {
  try {
    // Start with an empty cache to verify a cache miss.
    await invalidateAnalyticsCache();

    console.log("\n--- First request: PostgreSQL ---");

    const firstResult = await getSubscriptionAnalytics();
    console.log(JSON.stringify(firstResult, null, 2));

    console.log("\n--- Second request: Redis cache ---");

    const secondResult = await getSubscriptionAnalytics();
    console.log(JSON.stringify(secondResult, null, 2));

    console.log("\n--- Redis TTL ---");

    const ttl = await redisConnection.ttl(
      "analytics:subscription-metrics"
    );

    console.log(`Cache expires in ${ttl} seconds`);

    console.log("\nAnalytics test completed successfully!");
  } catch (error) {
    console.error("Analytics test failed:", error);
    process.exitCode = 1;
  } finally {
    await redisConnection.quit();
    await prisma.$disconnect();
  }
}

testAnalytics();