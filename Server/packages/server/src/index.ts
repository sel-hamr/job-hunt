import { loadConfig, type Config } from "./config/index.ts";
import { openDb } from "./db/connection.ts";
import { migrate } from "./db/migrate.ts";
import type { Server } from "node:http";
import { startHttp } from "./transports/http.ts";
import { startStdio } from "./transports/stdio.ts";

let config: Config;
try {
  config = loadConfig();
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}

const db = openDb(config.dbPath);
console.error(`database open: ${config.dbPath}`);

try {
  migrate(db);
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  if (err instanceof Error && err.cause) console.error(err.cause);
  db.close();
  process.exit(1);
}

const app = { db, dashboardUrl: config.dashboardUrl };

// Start the chosen door. closeDoor() stops it, before the database closes.
let closeDoor: () => Promise<void>;
if (config.transport.kind === "http") {
  const { host, port } = config.transport;
  let http: Server;
  try {
    http = await startHttp(app, config.transport);
  } catch (err) {
    console.error(`can't start HTTP on ${host}:${port}: ${err instanceof Error ? err.message : err}`);
    db.close();
    process.exit(1);
  }
  closeDoor = () =>
    new Promise((resolve) => {
      http.close(() => resolve());
      http.closeAllConnections();
    });
  console.error(`job-hunt MCP server ready on http://${host}:${port} (/mcp, /health)`);
} else {
  const stdio = startStdio(app);
  closeDoor = () => stdio.close();
  console.error("job-hunt MCP server ready on stdio");
}

// Close the door, then the database, when the server stops (Ctrl+C, or the app closes it).
async function shutdown() {
  await closeDoor();
  db.close();
  console.error("database closed");
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
