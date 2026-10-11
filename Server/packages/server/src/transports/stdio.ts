import {
  serveStdio,
  type StdioServerHandle,
} from "@modelcontextprotocol/server/stdio";
import { createServer, type AppContext } from "../server.ts";

// The stdio door: the AI app starts this process and talks through stdin / stdout.
// Never print to stdout here; logs go to stderr.
export function startStdio(app: AppContext): StdioServerHandle {
  return serveStdio(() => createServer(app));
}
