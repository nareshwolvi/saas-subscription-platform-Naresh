import { generateInvoice } from "./invoice.service.js";
import { sendInvoiceEmail } from "./email.service.js";

export async function fulfillSuccessfulPayment(paymentId: string) {
  // Generate an invoice, or reuse the existing invoice.
  const invoice = await generateInvoice(paymentId);

  // Send the invoice email, unless it was already sent.
  const email = await sendInvoiceEmail(invoice.id);

  console.log("Payment fulfillment completed:", {
    paymentId,
    invoiceNumber: invoice.invoiceNumber,
    recipient: email.recipient,
    emailAlreadySent: email.alreadySent,
  });

  return { invoice, email };
}