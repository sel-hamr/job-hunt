import type { Achievement, AchievementCreateInput, AchievementUpdateInput, Source } from "@jobhunt/shared";
import type { Db } from "../connection.ts";
import { orNull, toBool } from "../rows.ts";
import { updateRow } from "./update.ts";

type AchievementRow = {
  id: number;
  experience_id: number | null;
  project_id: number | null;
  text: string;
  number: string | null;
  position: number;
  source: string;
  checked: number;
  checked_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AchievementChanges = Omit<AchievementUpdateInput, "type">;

function toAchievement(row: AchievementRow): Achievement {
  return {
    type: "achievement",
    id: row.id,
    experience_id: row.experience_id,
    project_id: row.project_id,
    text: row.text,
    number: row.number,
    position: row.position,
    source: row.source as Source,
    checked: toBool(row.checked),
    checked_at: row.checked_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function insertAchievement(db: Db, input: AchievementCreateInput, source: Source): Achievement {
  const result = db
    .prepare(
      `INSERT INTO achievements (experience_id, project_id, text, number, position, source)
       VALUES (:experience_id, :project_id, :text, :number, :position, :source)`,
    )
    .run({
      experience_id: orNull(input.experience_id),
      project_id: orNull(input.project_id),
      text: input.text,
      number: orNull(input.number),
      position: input.position,
      source,
    });
  return getAchievement(db, Number(result.lastInsertRowid))!;
}

export function getAchievement(db: Db, id: number): Achievement | undefined {
  const row = db.prepare("SELECT * FROM achievements WHERE id = :id").get({ id }) as AchievementRow | undefined;
  return row && toAchievement(row);
}

// Grouped by job or project, then in list order.
export function listAchievements(db: Db): Achievement[] {
  const rows = db
    .prepare("SELECT * FROM achievements ORDER BY experience_id, project_id, position, id")
    .all() as AchievementRow[];
  return rows.map(toAchievement);
}

// The job / project link can't change (see AchievementUpdateInputSchema).
const columns = {
  text: "text",
  number: "number",
  position: "position",
} as const satisfies Record<keyof AchievementChanges, string>;

export function updateAchievement(db: Db, id: number, changes: AchievementChanges): Achievement | undefined {
  return updateRow(db, "achievements", id, columns, changes) ? getAchievement(db, id) : undefined;
}

export function deleteAchievement(db: Db, id: number): boolean {
  return db.prepare("DELETE FROM achievements WHERE id = :id").run({ id }).changes > 0;
}
