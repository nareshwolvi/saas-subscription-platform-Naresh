import { prisma } from "../config/database.js";
import { sendInvoiceEmail } from "../services/email.service.js";

async function testEmail() {
  try {
    const invoice = await prisma.invoice.findFirst({
      orderBy: { issuedAt: "desc" },
    });

    if (!invoice) {
      throw new Error("No invoice found. Generate an invoice first.");
    }

    const result = await sendInvoiceEmail(invoice.id);

    console.log("\nEmail sent successfully!");
    console.log({
      recipient: result.recipient,
      messageId: result.messageId,
      previewUrl: result.previewUrl,
    });

    if (result.previewUrl) {
      console.log("\nOpen the preview URL in your browser to inspect the email.");
    }
  } catch (error) {
    console.error("Email test failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

testEmail();