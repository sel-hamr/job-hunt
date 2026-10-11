import { loadConfig, type Config } from "./config/index.js";
import { openDb } from "./db/connection.js";
import { migrate } from "./db/migrate.js";

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

// Close the database when the server stops (Ctrl+C, or the app closes it).
function shutdown() {
  db.close();
  console.error("database closed");
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
