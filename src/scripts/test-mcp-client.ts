import "dotenv/config";
import path from "node:path";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function testMcpClient() {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [
      "--import",
      "tsx",
      path.resolve("src/mcp/server.ts"),
    ],
    cwd: process.cwd(),
    stderr: "inherit",
  });

  const client = new Client({
    name: "saas-analytics-test-client",
    version: "1.0.0",
  });

  try {
    console.log("Connecting to SaaS Analytics MCP server...");

    await client.connect(transport);

    console.log("\nMCP connection established!");

    // Discover available tools.
    const toolsResult = await client.listTools();

    console.log("\nAvailable MCP tools:");

    for (const tool of toolsResult.tools) {
      console.log({
        name: tool.name,
        description: tool.description,
      });
    }

    // Call every analytics tool.
    const toolNames = [
      "get_active_subscribers",
      "get_total_revenue",
      "get_monthly_revenue",
      "get_subscription_analytics",
    ];

    for (const toolName of toolNames) {
      console.log(`\nCalling MCP tool: ${toolName}`);

      const result = await client.callTool({
        name: toolName,
        arguments: {},
      });

      console.log("Tool result:");

      const contentItems = Array.isArray(result.content)
        ? result.content
        : [];

      for (const content of contentItems) {
        if (
          content &&
          typeof content === "object" &&
          "type" in content &&
          content.type === "text" &&
          "text" in content
        ) {
          console.log(content.text);
        }
      }

      if (result.isError) {
        console.error(`Tool ${toolName} returned an error`);
      }
    }

    console.log("\nAll MCP tool tests completed!");
  } catch (error) {
    console.error("MCP client test failed:", error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

testMcpClient();
