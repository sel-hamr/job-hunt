import fs from "node:fs";
import path from "node:path";
import type { Db } from "./connection.ts";

const migrationsDir = path.join(import.meta.dirname, "migrations");

export function migrate(db: Db): void {
  // 1. Which number did we reach last time?
  const row = db.prepare("PRAGMA user_version").get() as { user_version: number };
  const current = row.user_version;

  // 2. Find the files: "001_profile.sql" -> number 1
  const files = fs
    .readdirSync(migrationsDir)
    .filter((name) => /^\d{3}_.+\.sql$/.test(name))
    .sort();

  for (const file of files) {
    const version = Number(file.slice(0, 3));

    // 3. Skip the ones that already ran.
    if (version <= current) continue;

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");

    // 4. Run it inside a transaction. All or nothing.
    db.exec("BEGIN");
    try {
      db.exec(sql);
      db.exec(`PRAGMA user_version = ${version}`);
      db.exec("COMMIT");
      console.error(`migration ran: ${file}`);
    } catch (err) {
      // SQLite may have undone the transaction already. Only roll back if it is still open.
      if (db.isTransaction) db.exec("ROLLBACK");
      throw new Error(`migration failed: ${file}`, { cause: err });
    }
  }
}
