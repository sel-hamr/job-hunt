import type { Db } from "./connection.ts";

// Runs `work` inside a transaction: all of it is saved, or none of it.
export function inTransaction<T>(db: Db, work: () => T): T {
  db.exec("BEGIN");
  try {
    const result = work();
    db.exec("COMMIT");
    return result;
  } catch (err) {
    // SQLite may have undone the transaction already. Only roll back if it is still open.
    if (db.isTransaction) db.exec("ROLLBACK");
    throw err;
  }
}

// True when SQLite refused a row because a UNIQUE column already has that value.
export function isUniqueViolation(err: unknown): boolean {
  return (err as { errcode?: number } | null)?.errcode === 2067;
}
