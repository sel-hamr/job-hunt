import { McpServer } from "@modelcontextprotocol/server";
import type { Db } from "./db/connection.ts";
import { registerTools } from "./tools/index.ts";

// What every tool may use. Built once at start, in index.ts.
export type AppContext = {
  db: Db;
  dashboardUrl: string;
};

// The server factory: builds one MCP server with all tools.
// It gets the open database; it never opens one itself.
export function createServer(app: AppContext): McpServer {
  const server = new McpServer({ name: "job-hunt", version: "0.1.0" });
  registerTools(server, app);
  return server;
}
