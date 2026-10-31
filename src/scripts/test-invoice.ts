
import { prisma } from "../config/database.js";
import { generateInvoice } from "../services/invoice.service.js";

async function testInvoice() {
  try {
    const payment = await prisma.payment.findFirst({
      where: {
        status: "SUCCEEDED",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!payment) {
      throw new Error("No successful payment found");
    }

    const invoice = await generateInvoice(payment.id);

    console.log("Invoice generated successfully!");
    console.log({
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
      currency: invoice.currency,
      filePath: invoice.filePath,
    });
  } catch (error) {
    console.error("Invoice generation failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

testInvoice();
