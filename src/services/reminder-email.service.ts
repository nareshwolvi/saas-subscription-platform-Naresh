import "dotenv/config";
import nodemailer from "nodemailer";
import { ReminderJobData } from "../queues/reminder.queue.js";

const mailHost = process.env.MAIL_HOST;
const mailPort = Number(process.env.MAIL_PORT || 587);
const mailUser = process.env.MAIL_USER;
const mailPassword = process.env.MAIL_PASSWORD;

if (!mailHost || !mailUser || !mailPassword) {
  throw new Error("Email SMTP configuration is missing");
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

export async function sendSubscriptionReminderEmail(
  data: ReminderJobData
) {
  const expiryDate = new Date(data.expiresAt);

  if (Number.isNaN(expiryDate.getTime())) {
    throw new Error("Invalid subscription expiration date");
  }

  const formattedDate = expiryDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const amount = `${data.currency.toUpperCase()} ${(data.amount / 100).toFixed(2)}`;

  const info = await transporter.sendMail({
    from:
      process.env.MAIL_FROM ||
      "SaaS Subscription Platform <noreply@example.com>",
    to: data.email,
    subject: `Your ${data.planName} subscription is approaching expiration`,
    text: [
      `Hello ${data.customerName},`,
      "",
      `Your ${data.planName} subscription is approaching its expiration date.`,
      `Expiration date: ${formattedDate}`,
      `Subscription amount: ${amount}`,
      "",
      "Please review your subscription to avoid interruption of service.",
      "",
      "Thank you!",
      "SaaS Subscription Platform",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Subscription renewal reminder</h2>
        <p>Hello ${escapeHtml(data.customerName)},</p>
        <p>Your subscription is approaching its expiration date.</p>
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">Plan</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(data.planName)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">Amount</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${amount}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">Expiration date</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formattedDate}</td>
          </tr>
        </table>
        <p>Please review your subscription to avoid interruption of service.</p>
        <p>Thank you,<br/>SaaS Subscription Platform</p>
      </div>
    `,
  });

  console.log("Subscription reminder email sent:", {
    recipient: data.email,
    messageId: info.messageId,
    subscriptionId: data.subscriptionId,
  });

  return {
    messageId: info.messageId,
    previewUrl: nodemailer.getTestMessageUrl(info) || null,
  };
}