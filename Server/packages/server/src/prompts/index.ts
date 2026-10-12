import type { McpServer } from "@modelcontextprotocol/server";
import { registerImportCv } from "./import-cv.ts";

// Every prompt is added here, in one place.
export function registerPrompts(server: McpServer): void {
  registerImportCv(server);
}
