import type { Certificate, CertificateCreateInput, CertificateUpdateInput, Source } from "@jobhunt/shared";
import type { Db } from "../connection.ts";
import { orNull, toBool } from "../rows.ts";
import { updateRow } from "./update.ts";

type CertificateRow = {
  id: number;
  name: string;
  issuer: string;
  date: string;
  expires: string | null;
  link: string | null;
  source: string;
  checked: number;
  checked_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CertificateChanges = Omit<CertificateUpdateInput, "type">;

function toCertificate(row: CertificateRow): Certificate {
  return {
    type: "certificate",
    id: row.id,
    name: row.name,
    issuer: row.issuer,
    date: row.date,
    expires: row.expires,
    link: row.link,
    source: row.source as Source,
    checked: toBool(row.checked),
    checked_at: row.checked_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function insertCertificate(db: Db, input: CertificateCreateInput, source: Source): Certificate {
  const result = db
    .prepare(
      `INSERT INTO certificates (name, issuer, date, expires, link, source)
       VALUES (:name, :issuer, :date, :expires, :link, :source)`,
    )
    .run({
      name: input.name,
      issuer: input.issuer,
      date: input.date,
      expires: orNull(input.expires),
      link: orNull(input.link),
      source,
    });
  return getCertificate(db, Number(result.lastInsertRowid))!;
}

export function getCertificate(db: Db, id: number): Certificate | undefined {
  const row = db.prepare("SELECT * FROM certificates WHERE id = :id").get({ id }) as CertificateRow | undefined;
  return row && toCertificate(row);
}

// Newest first.
export function listCertificates(db: Db): Certificate[] {
  const rows = db.prepare("SELECT * FROM certificates ORDER BY date DESC, id DESC").all() as CertificateRow[];
  return rows.map(toCertificate);
}

const columns = {
  name: "name",
  issuer: "issuer",
  date: "date",
  expires: "expires",
  link: "link",
} as const satisfies Record<keyof CertificateChanges, string>;

export function updateCertificate(db: Db, id: number, changes: CertificateChanges): Certificate | undefined {
  return updateRow(db, "certificates", id, columns, changes) ? getCertificate(db, id) : undefined;
}

// Its skill proofs are deleted too (ON DELETE CASCADE).
export function deleteCertificate(db: Db, id: number): boolean {
  return db.prepare("DELETE FROM certificates WHERE id = :id").run({ id }).changes > 0;
}
