
import "dotenv/config";
import PDFDocument from "pdfkit";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { prisma } from "../config/database.js";

export async function generateInvoice(paymentId: string) {
  // Fetch payment and related information.
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      user: true,
      subscription: {
        include: {
          plan: true,
        },
      },
      invoice: true,
    },
  });

  if (!payment) {
    throw new Error(`Payment not found: ${paymentId}`);
  }

  if (payment.status !== "SUCCEEDED") {
    throw new Error("Cannot generate an invoice for an unsuccessful payment");
  }

  // Prevent duplicate invoices for the same payment.
  if (payment.invoice) {
    return payment.invoice;
  }

  const storagePath = path.resolve(
    process.env.INVOICE_STORAGE_PATH ?? "./storage/invoices"
  );

  await fs.promises.mkdir(storagePath, { recursive: true });

  const invoiceNumber =
    `INV-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}` +
    `-${randomUUID().slice(0, 8).toUpperCase()}`;

  const fileName = `${invoiceNumber}.pdf`;
  const filePath = path.join(storagePath, fileName);

  const amountInRupees = payment.amount / 100;

  const document = new PDFDocument({
    size: "A4",
    margin: 50,
  });

  const output = fs.createWriteStream(filePath);

  const pdfFinished = new Promise<void>((resolve, reject) => {
    output.on("finish", resolve);
    output.on("error", reject);
    document.on("error", reject);
  });

  document.pipe(output);

  // Invoice header.
  document
    .fontSize(24)
    .font("Helvetica-Bold")
    .text("INVOICE", { align: "right" });

  document.moveDown();

  document
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("SaaS Subscription Platform");

  document
    .fontSize(10)
    .font("Helvetica")
    .text("Subscription Services");

  document.moveDown(2);

  // Invoice details.
  document.font("Helvetica-Bold").text("Invoice Details");
  document.font("Helvetica");

  document.text(`Invoice Number: ${invoiceNumber}`);
  document.text(`Invoice Date: ${new Date().toLocaleDateString("en-IN")}`);
  document.text(`Payment ID: ${payment.razorpayPaymentId}`);

  document.moveDown();

  // Customer details.
  document.font("Helvetica-Bold").text("Bill To");
  document.font("Helvetica");

  document.text(payment.user.name ?? "Customer");
  document.text(payment.user.email);

  document.moveDown(2);

  // Subscription details.
  document.font("Helvetica-Bold").text("Description");
  document.font("Helvetica");

  document.text(
    payment.subscription?.plan.name ?? "SaaS Subscription"
  );

  document.text(
    `Billing period: ${payment.subscription?.plan.interval ?? "MONTH"}`
  );

  document.moveDown();

  // Amount summary.
  document
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(
      `Total Paid: ${payment.currency.toUpperCase()} ${amountInRupees.toFixed(2)}`
    );

  document.moveDown(2);

  document
    .fontSize(9)
    .font("Helvetica")
    .text("Payment Status: SUCCESSFUL");

  document.text("Payment Provider: Razorpay");

  document.moveDown(2);

  document
    .fontSize(9)
    .text("Thank you for subscribing to our SaaS platform.");

  document.end();

  try {
    await pdfFinished;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        userId: payment.userId,
        paymentId: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        filePath,
      },
    });

    console.log(`Invoice generated: ${invoice.invoiceNumber}`);

    return invoice;
  } catch (error) {
    await fs.promises.unlink(filePath).catch(() => {});
    throw error;
  }
}
