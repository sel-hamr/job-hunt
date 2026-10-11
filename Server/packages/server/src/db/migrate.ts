import fs from "node:fs";
import path from "node:path";
import type { Db } from "./connection.ts";
import { inTransaction } from "./transaction.ts";

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
    try {
      inTransaction(db, () => {
        db.exec(sql);
        db.exec(`PRAGMA user_version = ${version}`);
      });
      console.error(`migration ran: ${file}`);
    } catch (err) {
      throw new Error(`migration failed: ${file}`, { cause: err });
    }
  }
}
