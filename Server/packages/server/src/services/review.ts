import type {
  CheckInput,
  CheckResult,
  FixInput,
  FixResult,
  Profile,
  ProfileItem,
  ProfileWithItems,
  ReviewEntry,
  ReviewGroup,
  ReviewList,
  SkillProof,
} from "@jobhunt/shared";
import type { Db } from "../db/connection.ts";
import { setItemChecked } from "../db/repositories/checks.ts";
import * as profileRepo from "../db/repositories/profile.ts";
import { inTransaction } from "../db/transaction.ts";
import { NotFoundError } from "../lib/errors.ts";
import { getItem, getProfileWithItems, updateItem, updateProfile } from "./profile.ts";

// The review flow: the ONLY code that sets checked = true (docs/DATABASE.md, part 12).
// Only the admin API calls it, never an MCP tool.

const profileNotSaved = () => new NotFoundError("The profile is not saved yet");

// --- What waits for my check ---

const dates = (start: string | null, end: string | null, open = "now") =>
  start ? ` (${start} – ${end ?? open})` : "";

// A short name for an item, used in group titles and proof lines.
function nameOf(item: ProfileItem): string {
  switch (item.type) {
    case "experience":
      return `${item.position} @ ${item.company}`;
    case "project":
      return `Project: ${item.name}`;
    case "education":
      return `${item.degree}, ${item.school}`;
    case "certificate":
      return `${item.name} (${item.issuer})`;
    case "skill":
      return item.name;
    case "language":
      return item.language;
    case "achievement":
      return item.text;
    case "skill_proof":
      return `Skill proof ${item.id}`;
  }
}

// One line I can read and say yes or no to.
function summaryOf(item: ProfileItem, all: ProfileWithItems): string {
  switch (item.type) {
    case "experience":
      return `${item.position} @ ${item.company}${dates(item.start_date, item.end_date)}`;
    case "achievement":
      return item.text; // the number is already in the text
    case "skill":
      return `${item.name} (${item.category}, ${item.level})`;
    case "skill_proof":
      return proofSummary(item, all);
    case "project":
      return `${item.name}${item.role ? `, ${item.role}` : ""}${dates(item.start_date, item.end_date, "?")}`;
    case "education":
      return `${nameOf(item)}${dates(item.start_date, item.end_date, "?")}`;
    case "certificate":
      return `${item.name}, ${item.issuer} (${item.date})`;
    case "language":
      return `${item.language} (${item.level})`;
  }
}

function proofSummary(proof: SkillProof, all: ProfileWithItems): string {
  const skill = all.skills.find((s) => s.id === proof.skill_id);
  const target =
    (proof.experience_id != null && all.experiences.find((e) => e.id === proof.experience_id)) ||
    (proof.project_id != null && all.projects.find((p) => p.id === proof.project_id)) ||
    (proof.education_id != null && all.education.find((e) => e.id === proof.education_id)) ||
    (proof.certificate_id != null && all.certificates.find((c) => c.id === proof.certificate_id));
  return `${skill?.name ?? `Skill ${proof.skill_id}`} is proven by ${target ? nameOf(target) : "a missing item"}`;
}

// Everything with checked = false, grouped so I read related items together:
// one group per job and per project (with their achievements and proofs), then one per kind.
export function listUnchecked(db: Db): ReviewList {
  const all = getProfileWithItems(db);
  const entry = (item: ProfileItem): ReviewEntry => ({ item, summary: summaryOf(item, all) });
  const waiting = <T extends { checked: boolean }>(items: T[]) => items.filter((item) => !item.checked);
  const proofs = waiting(all.skill_proofs);

  const groups: ReviewGroup[] = [];
  const add = (key: string, title: string, items: ProfileItem[]) => {
    if (items.length > 0) groups.push({ key, title, entries: items.map(entry) });
  };

  for (const job of all.experiences) {
    add(`experience-${job.id}`, nameOf(job), [
      ...waiting([job]),
      ...waiting(all.achievements).filter((a) => a.experience_id === job.id),
      ...proofs.filter((p) => p.experience_id === job.id),
    ]);
  }
  for (const project of all.projects) {
    add(`project-${project.id}`, nameOf(project), [
      ...waiting([project]),
      ...waiting(all.achievements).filter((a) => a.project_id === project.id),
      ...proofs.filter((p) => p.project_id === project.id),
    ]);
  }
  add("education", "Education", [...waiting(all.education), ...proofs.filter((p) => p.education_id != null)]);
  add("certificates", "Certificates", [
    ...waiting(all.certificates),
    ...proofs.filter((p) => p.certificate_id != null),
  ]);
  add("skills", "Skills", waiting(all.skills));
  add("languages", "Languages", waiting(all.languages));

  const profile = all.profile && !all.profile.checked ? all.profile : null;
  const items = groups.reduce((sum, group) => sum + group.entries.length, 0);
  return { profile, groups, total: items + (profile ? 1 : 0) };
}

// --- Check ---

// All of them, or none: if one id is wrong, nothing is checked.
export function checkItems(db: Db, input: CheckInput): CheckResult {
  return inTransaction(db, () => {
    let profile: Profile | null = null;
    const items: ProfileItem[] = [];
    for (const target of input.items) {
      if (target.type === "profile") {
        if (!profileRepo.setProfileChecked(db, true)) throw profileNotSaved();
        profile = profileRepo.getProfile(db)!;
      } else {
        if (!setItemChecked(db, target.type, target.id, true)) {
          throw new NotFoundError(`${target.type} ${target.id} not found`);
        }
        items.push(getItem(db, target.type, target.id)!);
      }
    }
    return { profile, items };
  });
}

// --- Fix and check ---

// The normal edit (same rules) makes it not checked, then my check sets it back, in one transaction.
export function fixAndCheck(db: Db, input: FixInput): FixResult {
  return inTransaction(db, () => {
    if ("id" in input) {
      const item = updateItem(db, input.id, input.changes);
      setItemChecked(db, item.type, item.id, true);
      return getItem(db, item.type, item.id)!;
    }
    if (!profileRepo.getProfile(db)) throw profileNotSaved();
    updateProfile(db, input.changes);
    profileRepo.setProfileChecked(db, true);
    return profileRepo.getProfile(db)!;
  });
}
