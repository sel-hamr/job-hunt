import type { ProfileItemType } from "@jobhunt/shared";
import type { Db } from "../connection.ts";
import { now } from "../rows.ts";

// Item kind -> its table. Every one has the same checked / checked_at columns.
const tables = {
  experience: "experiences",
  achievement: "achievements",
  skill: "skills",
  skill_proof: "skill_proofs",
  project: "projects",
  education: "education",
  certificate: "certificates",
  language: "languages",
} as const satisfies Record<ProfileItemType, string>;

// Sets checked = 1 (with checked_at = now) or checked = 0 (with checked_at = NULL).
// Only the review flow may set true: see docs/DATABASE.md, part 12.
export function setItemChecked(db: Db, type: ProfileItemType, id: number, checked: boolean): boolean {
  const result = db
    .prepare(`UPDATE ${tables[type]} SET checked = :checked, checked_at = :checked_at WHERE id = :id`)
    .run({ id, checked: checked ? 1 : 0, checked_at: checked ? now() : null });
  return result.changes > 0;
}
