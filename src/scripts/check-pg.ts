
import "dotenv/config";
import { Client } from "pg";

async function checkPostgres() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is missing");
  }

  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 5000,
  });

  try {
    console.log("Connecting from Windows Node.js...");

    await client.connect();

    const result = await client.query(`
      SELECT
        current_user,
        current_database(),
        inet_server_addr() AS server_ip,
        inet_server_port() AS server_port,
        version()
    `);

    console.log("PostgreSQL connection successful!");
    console.table(result.rows);
  } catch (error) {
    console.error("PostgreSQL connection failed:", error);
  } finally {
    await client.end().catch(() => {});
  }
}

checkPostgres();
