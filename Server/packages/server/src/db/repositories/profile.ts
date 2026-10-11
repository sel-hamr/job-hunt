import type { Link, Profile, ProfileUpdateInput } from "@jobhunt/shared";
import type { Db } from "../connection.ts";
import { fromJson, now, orNull, toBool, toJson } from "../rows.ts";
import { updateRow } from "./update.ts";

// The profile table always has at most 1 row, with id = 1.
type ProfileRow = {
  id: number;
  name: string;
  headline: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  summary: string | null;
  links: string | null;
  checked: number;
  checked_at: string | null;
  created_at: string;
  updated_at: string;
};

// The first save needs a name; every other field is optional.
export type ProfileInsert = ProfileUpdateInput & { name: string };

function toProfile(row: ProfileRow): Profile {
  return {
    id: 1,
    name: row.name,
    headline: row.headline,
    email: row.email,
    phone: row.phone,
    city: row.city,
    country: row.country,
    summary: row.summary,
    links: fromJson<Link[]>(row.links, []),
    checked: toBool(row.checked),
    checked_at: row.checked_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// undefined until the profile is saved for the first time.
export function getProfile(db: Db): Profile | undefined {
  const row = db.prepare("SELECT * FROM profile WHERE id = 1").get() as ProfileRow | undefined;
  return row && toProfile(row);
}

export function insertProfile(db: Db, input: ProfileInsert): Profile {
  db.prepare(
    `INSERT INTO profile (id, name, headline, email, phone, city, country, summary, links)
     VALUES (1, :name, :headline, :email, :phone, :city, :country, :summary, :links)`,
  ).run({
    name: input.name,
    headline: orNull(input.headline),
    email: orNull(input.email),
    phone: orNull(input.phone),
    city: orNull(input.city),
    country: orNull(input.country),
    summary: orNull(input.summary),
    links: toJson(input.links ?? []),
  });
  return getProfile(db)!;
}

const columns = {
  name: "name",
  headline: "headline",
  email: "email",
  phone: "phone",
  city: "city",
  country: "country",
  summary: "summary",
  links: "links",
} as const satisfies Record<keyof ProfileUpdateInput, string>;

export function updateProfile(db: Db, changes: ProfileUpdateInput): Profile | undefined {
  return updateRow(db, "profile", 1, columns, changes) ? getProfile(db) : undefined;
}

// Like setItemChecked in checks.ts, for the profile (it is not an item kind).
// Only the review flow may set true: see docs/DATABASE.md, part 12.
export function setProfileChecked(db: Db, checked: boolean): boolean {
  return (
    db
      .prepare("UPDATE profile SET checked = :checked, checked_at = :checked_at WHERE id = 1")
      .run({ checked: checked ? 1 : 0, checked_at: checked ? now() : null }).changes > 0
  );
}
