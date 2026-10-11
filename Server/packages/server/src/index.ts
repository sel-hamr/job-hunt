import { loadConfig, type Config } from "./config/index.ts";
import { openDb } from "./db/connection.ts";
import { migrate } from "./db/migrate.ts";
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

const stdio = startStdio({ db, dashboardUrl: config.dashboardUrl });
console.error("job-hunt MCP server ready on stdio");

// Close the connection, then the database, when the server stops (Ctrl+C, or the app closes it).
async function shutdown() {
  await stdio.close();
  db.close();
  console.error("database closed");
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
