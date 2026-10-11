import type { McpServer } from "@modelcontextprotocol/server";
import type { AppContext } from "../server.ts";
import { registerProfileGet } from "./profile/get.ts";
import { registerProfileUpdate } from "./profile/update.ts";

// Every tool is added here, in one place.
export function registerTools(server: McpServer, app: AppContext): void {
  registerProfileGet(server, app);
  registerProfileUpdate(server, app);
}
