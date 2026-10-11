import type { Education, EducationCreateInput, EducationUpdateInput, Source } from "@jobhunt/shared";
import type { Db } from "../connection.ts";
import { orNull, toBool } from "../rows.ts";
import { updateRow } from "./update.ts";

type EducationRow = {
  id: number;
  school: string;
  degree: string;
  field: string | null;
  start_date: string | null;
  end_date: string | null;
  grade: string | null;
  source: string;
  checked: number;
  checked_at: string | null;
  created_at: string;
  updated_at: string;
};

export type EducationChanges = Omit<EducationUpdateInput, "type">;

function toEducation(row: EducationRow): Education {
  return {
    type: "education",
    id: row.id,
    school: row.school,
    degree: row.degree,
    field: row.field,
    start_date: row.start_date,
    end_date: row.end_date,
    grade: row.grade,
    source: row.source as Source,
    checked: toBool(row.checked),
    checked_at: row.checked_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function insertEducation(db: Db, input: EducationCreateInput, source: Source): Education {
  const result = db
    .prepare(
      `INSERT INTO education (school, degree, field, start_date, end_date, grade, source)
       VALUES (:school, :degree, :field, :start_date, :end_date, :grade, :source)`,
    )
    .run({
      school: input.school,
      degree: input.degree,
      field: orNull(input.field),
      start_date: orNull(input.start_date),
      end_date: orNull(input.end_date),
      grade: orNull(input.grade),
      source,
    });
  return getEducation(db, Number(result.lastInsertRowid))!;
}

export function getEducation(db: Db, id: number): Education | undefined {
  const row = db.prepare("SELECT * FROM education WHERE id = :id").get({ id }) as EducationRow | undefined;
  return row && toEducation(row);
}

// Like a CV: ongoing first, then newest.
export function listEducation(db: Db): Education[] {
  const rows = db
    .prepare("SELECT * FROM education ORDER BY end_date IS NOT NULL, end_date DESC, start_date DESC, id DESC")
    .all() as EducationRow[];
  return rows.map(toEducation);
}

const columns = {
  school: "school",
  degree: "degree",
  field: "field",
  start_date: "start_date",
  end_date: "end_date",
  grade: "grade",
} as const satisfies Record<keyof EducationChanges, string>;

export function updateEducation(db: Db, id: number, changes: EducationChanges): Education | undefined {
  return updateRow(db, "education", id, columns, changes) ? getEducation(db, id) : undefined;
}

// Its skill proofs are deleted too (ON DELETE CASCADE).
export function deleteEducation(db: Db, id: number): boolean {
  return db.prepare("DELETE FROM education WHERE id = :id").run({ id }).changes > 0;
}
