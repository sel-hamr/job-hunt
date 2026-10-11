import type { Experience, ExperienceCreateInput, ExperienceUpdateInput, Source } from "@jobhunt/shared";
import type { Db } from "../connection.ts";
import { fromBool, now, orNull, toBool } from "../rows.ts";

// One row of the experiences table, as SQLite gives it back.
type ExperienceRow = {
  id: number;
  company: string;
  position: string;
  type: string;
  city: string | null;
  remote: number;
  start_date: string;
  end_date: string | null;
  summary: string | null;
  source: string;
  checked: number;
  checked_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ExperienceChanges = Omit<ExperienceUpdateInput, "type">;

// Database row -> the shared Experience shape.
function toExperience(row: ExperienceRow): Experience {
  return {
    type: "experience",
    id: row.id,
    company: row.company,
    position: row.position,
    experience_type: row.type as Experience["experience_type"],
    city: row.city,
    remote: toBool(row.remote),
    start_date: row.start_date,
    end_date: row.end_date,
    summary: row.summary,
    source: row.source as Source,
    checked: toBool(row.checked),
    checked_at: row.checked_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function insertExperience(db: Db, input: ExperienceCreateInput, source: Source): Experience {
  const result = db
    .prepare(
      `INSERT INTO experiences (company, position, type, city, remote, start_date, end_date, summary, source)
       VALUES (:company, :position, :type, :city, :remote, :start_date, :end_date, :summary, :source)`,
    )
    .run({
      company: input.company,
      position: input.position,
      type: input.experience_type,
      city: orNull(input.city),
      remote: fromBool(input.remote ?? false),
      start_date: input.start_date,
      end_date: orNull(input.end_date),
      summary: orNull(input.summary),
      source,
    });
  return getExperience(db, Number(result.lastInsertRowid))!;
}

export function getExperience(db: Db, id: number): Experience | undefined {
  const row = db.prepare("SELECT * FROM experiences WHERE id = :id").get({ id }) as ExperienceRow | undefined;
  return row && toExperience(row);
}

// Newest job first; jobs I still have (no end_date) come before ended ones.
export function listExperiences(db: Db): Experience[] {
  const rows = db
    .prepare("SELECT * FROM experiences ORDER BY end_date IS NOT NULL, end_date DESC, start_date DESC, id DESC")
    .all() as ExperienceRow[];
  return rows.map(toExperience);
}

// API field -> database column. Only these columns can be changed.
const columns = {
  company: "company",
  position: "position",
  experience_type: "type",
  city: "city",
  remote: "remote",
  start_date: "start_date",
  end_date: "end_date",
  summary: "summary",
} as const satisfies Record<keyof ExperienceChanges, string>;

// Changes only the fields that are sent, and sets updated_at.
// It does not touch checked: the service decides that (see setItemChecked).
export function updateExperience(db: Db, id: number, changes: ExperienceChanges): Experience | undefined {
  const sets: string[] = ["updated_at = :updated_at"];
  const values: Record<string, string | number | null> = { id, updated_at: now() };

  for (const key of Object.keys(columns) as (keyof ExperienceChanges)[]) {
    const value = changes[key];
    if (value === undefined) continue;
    sets.push(`${columns[key]} = :${key}`);
    values[key] = typeof value === "boolean" ? fromBool(value) : value;
  }

  const result = db.prepare(`UPDATE experiences SET ${sets.join(", ")} WHERE id = :id`).run(values);
  return result.changes === 0 ? undefined : getExperience(db, id);
}

// Its achievements and skill proofs are deleted too (ON DELETE CASCADE).
export function deleteExperience(db: Db, id: number): boolean {
  return db.prepare("DELETE FROM experiences WHERE id = :id").run({ id }).changes > 0;
}
