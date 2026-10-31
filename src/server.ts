import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import subscriptionRoutes from "./routes/subscription.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Security and logging middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

// Register Razorpay webhook BEFORE express.json().
app.use("/api/webhooks/razorpay", webhookRoutes);

// Parse JSON request bodies
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "SaaS Subscription API is running",
  });
});

// API routes
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/analytics", analyticsRoutes);

// Global error handler
app.use(
  (
    error: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("API Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

