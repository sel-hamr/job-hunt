import type { Language, LanguageCreateInput, LanguageUpdateInput, Source } from "@jobhunt/shared";
import type { Db } from "../connection.ts";
import { toBool } from "../rows.ts";
import { updateRow } from "./update.ts";

type LanguageRow = {
  id: number;
  language: string;
  level: string;
  source: string;
  checked: number;
  checked_at: string | null;
  created_at: string;
  updated_at: string;
};

export type LanguageChanges = Omit<LanguageUpdateInput, "type">;

function toLanguage(row: LanguageRow): Language {
  return {
    type: "language",
    id: row.id,
    language: row.language,
    level: row.level as Language["level"],
    source: row.source as Source,
    checked: toBool(row.checked),
    checked_at: row.checked_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// The language is unique, upper/lower case ignored: a second "english" throws a UNIQUE error.
export function insertLanguage(db: Db, input: LanguageCreateInput, source: Source): Language {
  const result = db
    .prepare("INSERT INTO languages (language, level, source) VALUES (:language, :level, :source)")
    .run({ language: input.language, level: input.level, source });
  return getLanguage(db, Number(result.lastInsertRowid))!;
}

export function getLanguage(db: Db, id: number): Language | undefined {
  const row = db.prepare("SELECT * FROM languages WHERE id = :id").get({ id }) as LanguageRow | undefined;
  return row && toLanguage(row);
}

export function listLanguages(db: Db): Language[] {
  const rows = db.prepare("SELECT * FROM languages ORDER BY id").all() as LanguageRow[];
  return rows.map(toLanguage);
}

const columns = {
  language: "language",
  level: "level",
} as const satisfies Record<keyof LanguageChanges, string>;

export function updateLanguage(db: Db, id: number, changes: LanguageChanges): Language | undefined {
  return updateRow(db, "languages", id, columns, changes) ? getLanguage(db, id) : undefined;
}

export function deleteLanguage(db: Db, id: number): boolean {
  return db.prepare("DELETE FROM languages WHERE id = :id").run({ id }).changes > 0;
}
