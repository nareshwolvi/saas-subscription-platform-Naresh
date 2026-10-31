import { prisma } from "../config/database.js";

async function checkSubscriptions() {
  try {
    const users = await prisma.user.findMany({
      include: {
        subscriptions: {
          include: {
            plan: true,
          },
        },
      },
    });

    console.dir(users, { depth: 5 });
  } catch (error) {
    console.error("Failed to fetch subscriptions:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

checkSubscriptions();
