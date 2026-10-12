import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { loadConfig } from "../src/config/index.ts";
import { openDb } from "../src/db/connection.ts";
import { migrate } from "../src/db/migrate.ts";
import { resetProfile } from "../src/services/profile.ts";

// Empties the whole profile, after I type "yes". The tables stay.
// Run: npm run reset-profile
// It uses the same database as the server: DB_PATH from .env, or the default file.

const config = loadConfig();

const rl = createInterface({ input: stdin, output: stdout });
const answer = await rl.question(
  `Delete the whole profile in ${config.dbPath}? It can't be undone. Type "yes": `,
);
rl.close();

if (answer.trim() !== "yes") {
  console.log("Nothing deleted.");
  process.exit(0);
}

const db = openDb(config.dbPath);
migrate(db);
const { deleted } = resetProfile(db);
db.close();

console.log("Deleted:", deleted);
