import type { Db } from "../connection.ts";

// Every profile table. Children first, so each delete is clear on its own
// (ON DELETE CASCADE would remove them anyway).
const PROFILE_TABLES = [
  "skill_proofs",
  "achievements",
  "skills",
  "languages",
  "experiences",
  "projects",
  "education",
  "certificates",
  "profile",
] as const;

// Deletes every row of every profile table. The tables stay.
export function deleteAllProfileRows(db: Db): void {
  for (const table of PROFILE_TABLES) {
    db.exec(`DELETE FROM ${table}`);
  }
}
