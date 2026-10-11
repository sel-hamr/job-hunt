import type { Db } from "../connection.ts";
import { now, toSqlValue, type SqlValue } from "../rows.ts";

// Changes only the fields that are sent (not undefined), and sets updated_at.
// `columns` maps each API field that may change to its database column. Only those
// names ever go into the SQL text; every value goes in as a :parameter.
// Returns false if no row has this id.
export function updateRow(
  db: Db,
  table: string,
  id: number,
  columns: Record<string, string>,
  changes: Record<string, unknown>,
): boolean {
  const sets = ["updated_at = :updated_at"];
  const values: Record<string, SqlValue> = { id, updated_at: now() };

  for (const [field, column] of Object.entries(columns)) {
    const value = changes[field];
    if (value === undefined) continue;
    sets.push(`${column} = :${field}`);
    values[field] = toSqlValue(value);
  }

  return db.prepare(`UPDATE ${table} SET ${sets.join(", ")} WHERE id = :id`).run(values).changes > 0;
}
