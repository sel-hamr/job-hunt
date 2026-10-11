import type { Skill, SkillCreateInput, SkillUpdateInput, Source } from "@jobhunt/shared";
import type { Db } from "../connection.ts";
import { fromJson, toBool, toJson } from "../rows.ts";
import { updateRow } from "./update.ts";

type SkillRow = {
  id: number;
  name: string;
  other_names: string | null;
  category: string;
  level: string;
  source: string;
  checked: number;
  checked_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SkillChanges = Omit<SkillUpdateInput, "type">;

function toSkill(row: SkillRow): Skill {
  return {
    type: "skill",
    id: row.id,
    name: row.name,
    other_names: fromJson<string[]>(row.other_names, []),
    category: row.category as Skill["category"],
    level: row.level as Skill["level"],
    source: row.source as Source,
    checked: toBool(row.checked),
    checked_at: row.checked_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// The name is unique, upper/lower case ignored: saving "node.js" when "Node.js"
// exists throws a UNIQUE error. Use findSkillByName first.
export function insertSkill(db: Db, input: SkillCreateInput, source: Source): Skill {
  const result = db
    .prepare(
      `INSERT INTO skills (name, other_names, category, level, source)
       VALUES (:name, :other_names, :category, :level, :source)`,
    )
    .run({
      name: input.name,
      other_names: toJson(input.other_names ?? []),
      category: input.category,
      level: input.level,
      source,
    });
  return getSkill(db, Number(result.lastInsertRowid))!;
}

export function getSkill(db: Db, id: number): Skill | undefined {
  const row = db.prepare("SELECT * FROM skills WHERE id = :id").get({ id }) as SkillRow | undefined;
  return row && toSkill(row);
}

// Upper/lower case ignored: "node.js" finds "Node.js" (the column is COLLATE NOCASE).
export function findSkillByName(db: Db, name: string): Skill | undefined {
  const row = db.prepare("SELECT * FROM skills WHERE name = :name").get({ name }) as SkillRow | undefined;
  return row && toSkill(row);
}

export function listSkills(db: Db): Skill[] {
  const rows = db.prepare("SELECT * FROM skills ORDER BY category, name").all() as SkillRow[];
  return rows.map(toSkill);
}

const columns = {
  name: "name",
  other_names: "other_names",
  category: "category",
  level: "level",
} as const satisfies Record<keyof SkillChanges, string>;

export function updateSkill(db: Db, id: number, changes: SkillChanges): Skill | undefined {
  return updateRow(db, "skills", id, columns, changes) ? getSkill(db, id) : undefined;
}

// Its proofs are deleted too (ON DELETE CASCADE).
export function deleteSkill(db: Db, id: number): boolean {
  return db.prepare("DELETE FROM skills WHERE id = :id").run({ id }).changes > 0;
}
