import type { SkillProof, SkillProofCreateInput, Source } from "@jobhunt/shared";
import type { Db } from "../connection.ts";
import { orNull, toBool } from "../rows.ts";

type SkillProofRow = {
  id: number;
  skill_id: number;
  experience_id: number | null;
  project_id: number | null;
  education_id: number | null;
  certificate_id: number | null;
  source: string;
  checked: number;
  checked_at: string | null;
  created_at: string;
  updated_at: string;
};

function toSkillProof(row: SkillProofRow): SkillProof {
  return {
    type: "skill_proof",
    id: row.id,
    skill_id: row.skill_id,
    experience_id: row.experience_id,
    project_id: row.project_id,
    education_id: row.education_id,
    certificate_id: row.certificate_id,
    source: row.source as Source,
    checked: toBool(row.checked),
    checked_at: row.checked_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// The same item can't prove the same skill twice: that throws a UNIQUE error.
export function insertSkillProof(db: Db, input: SkillProofCreateInput, source: Source): SkillProof {
  const result = db
    .prepare(
      `INSERT INTO skill_proofs (skill_id, experience_id, project_id, education_id, certificate_id, source)
       VALUES (:skill_id, :experience_id, :project_id, :education_id, :certificate_id, :source)`,
    )
    .run({
      skill_id: input.skill_id,
      experience_id: orNull(input.experience_id),
      project_id: orNull(input.project_id),
      education_id: orNull(input.education_id),
      certificate_id: orNull(input.certificate_id),
      source,
    });
  return getSkillProof(db, Number(result.lastInsertRowid))!;
}

export function getSkillProof(db: Db, id: number): SkillProof | undefined {
  const row = db.prepare("SELECT * FROM skill_proofs WHERE id = :id").get({ id }) as SkillProofRow | undefined;
  return row && toSkillProof(row);
}

export function listSkillProofs(db: Db): SkillProof[] {
  const rows = db.prepare("SELECT * FROM skill_proofs ORDER BY skill_id, id").all() as SkillProofRow[];
  return rows.map(toSkillProof);
}

// No update: a proof has nothing to change. Delete it and add a new one.

export function deleteSkillProof(db: Db, id: number): boolean {
  return db.prepare("DELETE FROM skill_proofs WHERE id = :id").run({ id }).changes > 0;
}
