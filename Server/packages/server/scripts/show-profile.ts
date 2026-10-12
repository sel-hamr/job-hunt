import { loadConfig } from "../src/config/index.ts";
import { openDb } from "../src/db/connection.ts";
import { migrate } from "../src/db/migrate.ts";
import { getProfileWithItems } from "../src/services/profile.ts";

// Prints my whole profile as JSON, like the profile_get tool.
// Run: npm run show-profile
//      npm run show-profile -- --only-checked   (only the facts I have checked)
// It uses the same database as the server: DB_PATH from .env, or the default file.

const onlyChecked = process.argv.includes("--only-checked");
const config = loadConfig();

const db = openDb(config.dbPath);
migrate(db);
const profile = getProfileWithItems(db, { onlyChecked });
db.close();

console.error(`database: ${config.dbPath}${onlyChecked ? " (only checked)" : ""}`);
console.log(JSON.stringify(profile, null, 2));
