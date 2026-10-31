import "dotenv/config";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { z } from "zod";

import {
  getSubscriptionAnalytics,
} from "../services/analytics.service.js";

const server = new McpServer({
  name: process.env.MCP_SERVER_NAME || "saas-analytics",
  version: "1.0.0",
});

// Tool 1: Get active subscribers.
server.registerTool(
  "get_active_subscribers",
  {
    title: "Get Active Subscribers",
    description:
      "Returns the current number of active SaaS subscribers.",
    inputSchema: {},
  },
  async () => {
    try {
      const analytics = await getSubscriptionAnalytics();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                activeSubscribers: analytics.activeSubscribers,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text:
              error instanceof Error
                ? error.message
                : "Failed to retrieve active subscribers",
          },
        ],
      };
    }
  }
);

// Tool 2: Get total revenue.
server.registerTool(
  "get_total_revenue",
  {
    title: "Get Total Revenue",
    description:
      "Returns total successful payment revenue grouped by currency.",
    inputSchema: {},
  },
  async () => {
    try {
      const analytics = await getSubscriptionAnalytics();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              analytics.totalRevenue,
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text:
              error instanceof Error
                ? error.message
                : "Failed to retrieve total revenue",
          },
        ],
      };
    }
  }
);

// Tool 3: Get monthly revenue.
server.registerTool(
  "get_monthly_revenue",
  {
    title: "Get Monthly Revenue",
    description:
      "Returns successful payment revenue for the current calendar month, grouped by currency.",
    inputSchema: {},
  },
  async () => {
    try {
      const analytics = await getSubscriptionAnalytics();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              analytics.monthlyRevenue,
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text:
              error instanceof Error
                ? error.message
                : "Failed to retrieve monthly revenue",
          },
        ],
      };
    }
  }
);

// Tool 4: Get complete subscription analytics.
server.registerTool(
  "get_subscription_analytics",
  {
    title: "Get Subscription Analytics",
    description:
      "Returns active subscribers, total subscriptions, total revenue and monthly revenue.",
    inputSchema: {},
  },
  async () => {
    try {
      const analytics = await getSubscriptionAnalytics();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(analytics, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text:
              error instanceof Error
                ? error.message
                : "Failed to retrieve subscription analytics",
          },
        ],
      };
    }
  }
);

async function startServer() {
  const transport = new StdioServerTransport();

  await server.connect(transport);

  // IMPORTANT:
  // Do not use console.log() in an MCP stdio server.
  // stdout is reserved for MCP protocol messages.
  console.error("SaaS Analytics MCP server started");
}

startServer().catch((error) => {
  console.error("Failed to start MCP server:", error);
  process.exitCode = 1;
});
