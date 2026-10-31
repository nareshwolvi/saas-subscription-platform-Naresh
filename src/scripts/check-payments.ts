
import { prisma } from "../config/database.js";

async function checkPayments() {
  try {
    const subscriptions = await prisma.subscription.findMany({
      include: {
        user: true,
        plan: true,
        payments: true,
      },
    });

    console.dir(subscriptions, { depth: 5 });

    console.log("\nPayment summary:");

    const payments = await prisma.payment.findMany({
      include: {
        user: true,
        subscription: true,
      },
    });

    console.dir(payments, { depth: 5 });
  } catch (error) {
    console.error("Database verification failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

checkPayments();
