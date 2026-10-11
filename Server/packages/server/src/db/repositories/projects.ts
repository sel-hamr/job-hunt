import type { Link, Project, ProjectCreateInput, ProjectUpdateInput, Source } from "@jobhunt/shared";
import type { Db } from "../connection.ts";
import { fromJson, orNull, toBool, toJson } from "../rows.ts";
import { updateRow } from "./update.ts";

type ProjectRow = {
  id: number;
  name: string;
  role: string | null;
  description: string | null;
  links: string | null;
  start_date: string | null;
  end_date: string | null;
  source: string;
  checked: number;
  checked_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectChanges = Omit<ProjectUpdateInput, "type">;

function toProject(row: ProjectRow): Project {
  return {
    type: "project",
    id: row.id,
    name: row.name,
    role: row.role,
    description: row.description,
    links: fromJson<Link[]>(row.links, []),
    start_date: row.start_date,
    end_date: row.end_date,
    source: row.source as Source,
    checked: toBool(row.checked),
    checked_at: row.checked_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function insertProject(db: Db, input: ProjectCreateInput, source: Source): Project {
  const result = db
    .prepare(
      `INSERT INTO projects (name, role, description, links, start_date, end_date, source)
       VALUES (:name, :role, :description, :links, :start_date, :end_date, :source)`,
    )
    .run({
      name: input.name,
      role: orNull(input.role),
      description: orNull(input.description),
      links: toJson(input.links ?? []),
      start_date: orNull(input.start_date),
      end_date: orNull(input.end_date),
      source,
    });
  return getProject(db, Number(result.lastInsertRowid))!;
}

export function getProject(db: Db, id: number): Project | undefined {
  const row = db.prepare("SELECT * FROM projects WHERE id = :id").get({ id }) as ProjectRow | undefined;
  return row && toProject(row);
}

// Like a CV: ongoing first, then newest.
export function listProjects(db: Db): Project[] {
  const rows = db
    .prepare("SELECT * FROM projects ORDER BY end_date IS NOT NULL, end_date DESC, start_date DESC, id DESC")
    .all() as ProjectRow[];
  return rows.map(toProject);
}

const columns = {
  name: "name",
  role: "role",
  description: "description",
  links: "links",
  start_date: "start_date",
  end_date: "end_date",
} as const satisfies Record<keyof ProjectChanges, string>;

export function updateProject(db: Db, id: number, changes: ProjectChanges): Project | undefined {
  return updateRow(db, "projects", id, columns, changes) ? getProject(db, id) : undefined;
}

// Its achievements and skill proofs are deleted too (ON DELETE CASCADE).
export function deleteProject(db: Db, id: number): boolean {
  return db.prepare("DELETE FROM projects WHERE id = :id").run({ id }).changes > 0;
}
