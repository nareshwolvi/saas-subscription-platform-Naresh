
import { prisma } from "../config/database.js";

async function checkDatabase() {
  try {
    console.log("Checking PostgreSQL connection...");

    const result = await prisma.$queryRaw<
      Array<{ now: Date }>
    >`SELECT NOW() AS now`;

    console.log("PostgreSQL connected successfully!");
    console.log("Database time:", result[0]?.now);

    const userCount = await prisma.user.count();

    console.log("Current user count:", userCount);
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
