
import "dotenv/config";
import nodemailer from "nodemailer";
import fs from "node:fs";
import path from "node:path";
import { prisma } from "../config/database.js";

// --------------------------------------------------
// SMTP CONFIGURATION
// --------------------------------------------------

const mailHost = process.env.MAIL_HOST;
const mailPort = Number(process.env.MAIL_PORT || 587);
const mailUser = process.env.MAIL_USER;
const mailPassword = process.env.MAIL_PASSWORD;

const mailFrom =
  process.env.MAIL_FROM ||
  "SaaS Subscription Platform <noreply@example.com>";

if (!mailHost || !mailUser || !mailPassword) {
  throw new Error(
    "MAIL_HOST, MAIL_USER and MAIL_PASSWORD must be configured"
  );
}

const transporter = nodemailer.createTransport({
  host: mailHost,
  port: mailPort,
  secure: mailPort === 465,
  auth: {
    user: mailUser,
    pass: mailPassword,
  },
});

// --------------------------------------------------
// SEND INVOICE EMAIL
// --------------------------------------------------

export async function sendInvoiceEmail(invoiceId: string) {
  // 1. Fetch invoice with customer and payment details.
  const invoice = await prisma.invoice.findUnique({
    where: {
      id: invoiceId,
    },
    include: {
      user: true,
      payment: {
        include: {
          subscription: {
            include: {
              plan: true,
            },
          },
        },
      },
    },
  });

  if (!invoice) {
    throw new Error(`Invoice not found: ${invoiceId}`);
  }

  // 2. Validate payment status.
  if (invoice.payment.status !== "SUCCEEDED") {
    throw new Error(
      "Cannot email an invoice for an unsuccessful payment"
    );
  }

  // 3. Prevent sending an already-sent invoice email.
  if (invoice.emailSentAt) {
    console.log(
      `Invoice email already sent: ${invoice.invoiceNumber}`
    );

    return {
      messageId: null,
      recipient: invoice.user.email,
      previewUrl: null,
      alreadySent: true,
    };
  }

  // 4. Verify invoice PDF exists.
  const pdfPath = path.resolve(invoice.filePath);

  if (!fs.existsSync(pdfPath)) {
    throw new Error(`Invoice PDF not found: ${pdfPath}`);
  }

  // 5. Prepare invoice information.
  const customerName = invoice.user.name ?? "Customer";

  const planName =
    invoice.payment.subscription?.plan.name ??
    "SaaS Subscription";

  const amount = `${invoice.currency.toUpperCase()} ${(
    invoice.amount / 100
  ).toFixed(2)}`;

  // 6. Send email with invoice PDF attachment.
  const info = await transporter.sendMail({
    from: mailFrom,

    to: invoice.user.email,

    subject: `Payment successful - Invoice ${invoice.invoiceNumber}`,

    text: [
      `Hello ${customerName},`,
      "",
      "Your subscription payment was successful.",
      "",
      `Plan: ${planName}`,
      `Amount paid: ${amount}`,
      `Invoice number: ${invoice.invoiceNumber}`,
      "",
      "Your invoice is attached to this email.",
      "",
      "Thank you for subscribing!",
      "",
      "SaaS Subscription Platform",
    ].join("\n"),

    html: `
      <!DOCTYPE html>
      <html>
        <body style="
          font-family: Arial, sans-serif;
          background-color: #f5f5f5;
          padding: 20px;
        ">
          <div style="
            max-width: 600px;
            margin: auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
          ">
            <h2 style="color: #16a34a;">
              Payment successful!
            </h2>

            <p>
              Hello ${escapeHtml(customerName)},
            </p>

            <p>
              Your subscription payment has been received successfully.
            </p>

            <table style="
              border-collapse: collapse;
              width: 100%;
              margin-top: 20px;
            ">
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">
                  Plan
                </td>
                <td style="padding: 10px; border: 1px solid #ddd;">
                  ${escapeHtml(planName)}
                </td>
              </tr>

              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">
                  Amount paid
                </td>
                <td style="padding: 10px; border: 1px solid #ddd;">
                  ${amount}
                </td>
              </tr>

              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">
                  Invoice number
                </td>
                <td style="padding: 10px; border: 1px solid #ddd;">
                  ${escapeHtml(invoice.invoiceNumber)}
                </td>
              </tr>
            </table>

            <p style="margin-top: 25px;">
              Your invoice PDF is attached to this email.
            </p>

            <p>
              Thank you for subscribing!
            </p>

            <p style="color: #666;">
              SaaS Subscription Platform
            </p>
          </div>
        </body>
      </html>
    `,

    attachments: [
      {
        filename: `${invoice.invoiceNumber}.pdf`,
        path: pdfPath,
        contentType: "application/pdf",
      },
    ],
  });

  // 7. Record successful SMTP acceptance in the database.
  await prisma.invoice.update({
    where: {
      id: invoice.id,
    },
    data: {
      emailSentAt: new Date(),
    },
  });

  // 8. Generate Ethereal preview URL.
  const previewUrl = nodemailer.getTestMessageUrl(info);

  console.log("-----------------------------------");
  console.log("Invoice email sent successfully");
  console.log(`Recipient: ${invoice.user.email}`);
  console.log(`Invoice: ${invoice.invoiceNumber}`);
  console.log(`Message ID: ${info.messageId}`);
  console.log("-----------------------------------");

  return {
    messageId: info.messageId,
    recipient: invoice.user.email,
    previewUrl: previewUrl || null,
    alreadySent: false,
  };
}

// --------------------------------------------------
// HTML ESCAPING
// --------------------------------------------------

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character] ?? character;
  });
}
