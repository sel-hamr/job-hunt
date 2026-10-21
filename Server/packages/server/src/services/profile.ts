import {
  cvDateIsBefore,
  type Achievement,
  type Profile,
  type ProfileItem,
  type ProfileItemCreateInput,
  type ProfileItemType,
  type ProfileItemUpdateInput,
  type ProfileUpdateInput,
  type ProfileImportInput,
  type ProfileImportResult,
  type ProfileResetResult,
  type ProfileWithItems,
  type SkillProofCreateInput,
  type SkillProof,
  type Source,
} from "@jobhunt/shared";
import type { Db } from "../db/connection.ts";
import { inTransaction, isUniqueViolation } from "../db/transaction.ts";
import * as achievements from "../db/repositories/achievements.ts";
import * as certificates from "../db/repositories/certificates.ts";
import { setItemChecked } from "../db/repositories/checks.ts";
import * as education from "../db/repositories/education.ts";
import * as experiences from "../db/repositories/experiences.ts";
import * as languages from "../db/repositories/languages.ts";
import * as profile from "../db/repositories/profile.ts";
import * as projects from "../db/repositories/projects.ts";
import { deleteAllProfileRows } from "../db/repositories/reset.ts";
import * as skillProofs from "../db/repositories/skill-proofs.ts";
import * as skills from "../db/repositories/skills.ts";
import { ConflictError, NotFoundError, RuleError } from "../lib/errors.ts";
import { addSkillYears } from "./skill-years.ts";

// The profile rules, used by the MCP tools and the admin API alike.
// The main rule: a normal edit always makes the item NOT checked (docs/DATABASE.md, part 12).
// Only the review flow may set checked = true; it does not go through this file.

const LABELS: Record<ProfileItemType, string> = {
  experience: "Experience",
  achievement: "Achievement",
  skill: "Skill",
  skill_proof: "Skill proof",
  project: "Project",
  education: "Education",
  certificate: "Certificate",
  language: "Language",
};

const notFound = (type: ProfileItemType, id: number) => new NotFoundError(`${LABELS[type]} ${id} not found`);

function withoutType<T extends { type: string }>(input: T): Omit<T, "type"> {
  const { type: _type, ...rest } = input;
  return rest;
}

// --- Read ---

export function getItem(db: Db, type: ProfileItemType, id: number): ProfileItem | undefined {
  switch (type) {
    case "experience":
      return experiences.getExperience(db, id);
    case "achievement":
      return achievements.getAchievement(db, id);
    case "skill":
      return skills.getSkill(db, id);
    case "skill_proof":
      return skillProofs.getSkillProof(db, id);
    case "project":
      return projects.getProject(db, id);
    case "education":
      return education.getEducation(db, id);
    case "certificate":
      return certificates.getCertificate(db, id);
    case "language":
      return languages.getLanguage(db, id);
  }
}

// The whole profile. With onlyChecked, only facts I have checked are kept: the AI uses
// this to match jobs and write CVs, so it never uses a fact I haven't confirmed.
// Each skill comes with its years, counted from checked proofs only, in both modes.
export function getProfileWithItems(db: Db, options: { onlyChecked?: boolean } = {}): ProfileWithItems {
  const experienceList = experiences.listExperiences(db);
  const proofList = skillProofs.listSkillProofs(db);
  const projectList = projects.listProjects(db);
  const all: ProfileWithItems = {
    profile: profile.getProfile(db) ?? null,
    experiences: experienceList,
    achievements: achievements.listAchievements(db),
    skills: addSkillYears(skills.listSkills(db), proofList, experienceList, projectList),
    skill_proofs: proofList,
    projects: projectList,
    education: education.listEducation(db),
    certificates: certificates.listCertificates(db),
    languages: languages.listLanguages(db),
  };
  return options.onlyChecked ? keepChecked(all) : all;
}

function keepChecked(all: ProfileWithItems): ProfileWithItems {
  const checked = <T extends { checked: boolean }>(items: T[]) => items.filter((item) => item.checked);
  const idsOf = (items: { id: number }[]) => new Set(items.map((item) => item.id));

  const kept = {
    experiences: checked(all.experiences),
    skills: checked(all.skills),
    projects: checked(all.projects),
    education: checked(all.education),
    certificates: checked(all.certificates),
  };
  const ids = {
    experience: idsOf(kept.experiences),
    skill: idsOf(kept.skills),
    project: idsOf(kept.projects),
    education: idsOf(kept.education),
    certificate: idsOf(kept.certificates),
  };

  return {
    profile: all.profile?.checked ? all.profile : null,
    ...kept,
    // An achievement counts only if its job or project is checked too.
    achievements: checked(all.achievements).filter((a) =>
      a.experience_id !== null ? ids.experience.has(a.experience_id) : ids.project.has(a.project_id!),
    ),
    // A proof counts only if its skill and the item it points to are checked too.
    skill_proofs: checked(all.skill_proofs).filter((p) => {
      const [type, id] = proofTarget(p);
      return ids.skill.has(p.skill_id) && ids[type].has(id);
    }),
    languages: checked(all.languages),
  };
}

// --- Profile (the main row) ---

export function updateProfile(db: Db, changes: ProfileUpdateInput): Profile {
  if (!profile.getProfile(db)) {
    if (!changes.name) throw new RuleError("The first save of the profile needs a name");
    return profile.insertProfile(db, { ...changes, name: changes.name });
  }
  return inTransaction(db, () => {
    profile.updateProfile(db, changes);
    profile.setProfileChecked(db, false);
    return profile.getProfile(db)!;
  });
}

// --- Add ---

type ProofTargetType = "experience" | "project" | "education" | "certificate";

// Which item a skill proof points to (exactly one is set, see SkillProofSchema).
function proofTarget(p: {
  experience_id?: number | null;
  project_id?: number | null;
  education_id?: number | null;
  certificate_id?: number | null;
}): [ProofTargetType, number] {
  if (p.experience_id != null) return ["experience", p.experience_id];
  if (p.project_id != null) return ["project", p.project_id];
  if (p.education_id != null) return ["education", p.education_id];
  return ["certificate", p.certificate_id!];
}

function requireItem(db: Db, type: ProfileItemType, id: number): void {
  if (!getItem(db, type, id)) throw notFound(type, id);
}

// New items always start NOT checked (the database default).
export function addItem(db: Db, input: ProfileItemCreateInput, source: Source): ProfileItem {
  switch (input.type) {
    case "experience":
      return experiences.insertExperience(db, input, source);

    case "achievement":
      if (input.experience_id != null) requireItem(db, "experience", input.experience_id);
      if (input.project_id != null) requireItem(db, "project", input.project_id);
      return achievements.insertAchievement(db, input, source);

    case "skill": {
      const same = skills.findSkillByName(db, input.name);
      if (same) throw new ConflictError(`You already have the skill "${same.name}" (id ${same.id})`);
      return skills.insertSkill(db, input, source);
    }

    case "skill_proof": {
      requireItem(db, "skill", input.skill_id);
      const [type, id] = proofTarget(input);
      requireItem(db, type, id);
      try {
        return skillProofs.insertSkillProof(db, input, source);
      } catch (err) {
        if (isUniqueViolation(err)) throw new ConflictError(`${LABELS[type]} ${id} already proves skill ${input.skill_id}`);
        throw err;
      }
    }

    case "project":
      return projects.insertProject(db, input, source);

    case "education":
      return education.insertEducation(db, input, source);

    case "certificate":
      return certificates.insertCertificate(db, input, source);

    case "language":
      try {
        return languages.insertLanguage(db, input, source);
      } catch (err) {
        if (isUniqueViolation(err)) throw new ConflictError(`You already have the language "${input.language}"`);
        throw err;
      }
  }
}

// --- Change ---

// The new value if one is sent (null clears it), else the saved one.
const pick = (sent: string | null | undefined, saved: string | null) => (sent === undefined ? saved : sent);

// The schema only checks dates sent together. Here, a new date is checked against the saved one.
function checkDates(saved: ProfileItem, input: ProfileItemUpdateInput): void {
  if ((input.type === "experience" || input.type === "project" || input.type === "education") && "start_date" in saved) {
    const start = pick(input.start_date, saved.start_date);
    const end = pick(input.end_date, saved.end_date);
    if (start && end && cvDateIsBefore(end, start)) throw new RuleError("end_date can't be before start_date");
  }
  if (input.type === "certificate" && saved.type === "certificate") {
    const date = input.date ?? saved.date;
    const expires = pick(input.expires, saved.expires);
    if (expires && cvDateIsBefore(expires, date)) throw new RuleError("expires can't be before date");
  }
}

function applyUpdate(db: Db, id: number, input: ProfileItemUpdateInput): void {
  switch (input.type) {
    case "experience":
      experiences.updateExperience(db, id, withoutType(input));
      return;
    case "achievement":
      achievements.updateAchievement(db, id, withoutType(input));
      return;
    case "skill":
      skills.updateSkill(db, id, withoutType(input));
      return;
    case "project":
      projects.updateProject(db, id, withoutType(input));
      return;
    case "education":
      education.updateEducation(db, id, withoutType(input));
      return;
    case "certificate":
      certificates.updateCertificate(db, id, withoutType(input));
      return;
    case "language":
      languages.updateLanguage(db, id, withoutType(input));
      return;
  }
}

// Changes an item. It becomes NOT checked: my old check was for the old text.
export function updateItem(db: Db, id: number, input: ProfileItemUpdateInput): ProfileItem {
  const saved = getItem(db, input.type, id);
  if (!saved) throw notFound(input.type, id);
  checkDates(saved, input);

  if (input.type === "skill" && input.name) {
    const same = skills.findSkillByName(db, input.name);
    if (same && same.id !== id) throw new ConflictError(`You already have the skill "${same.name}" (id ${same.id})`);
  }

  return inTransaction(db, () => {
    try {
      applyUpdate(db, id, input);
    } catch (err) {
      if (isUniqueViolation(err)) throw new ConflictError(`${LABELS[input.type]} with this name already exists`);
      throw err;
    }
    setItemChecked(db, input.type, id, false);
    return getItem(db, input.type, id)!;
  });
}

// --- Delete ---

export type DeleteResult = {
  deleted: ProfileItem;
  // Rows the database removed with it (ON DELETE CASCADE).
  also_deleted: { achievements: Achievement[]; skill_proofs: SkillProof[] };
  // Jobs whose match used this item. Always empty until jobs exist (build step 2).
  jobs_to_rematch: number[];
};

function deleteRow(db: Db, type: ProfileItemType, id: number): void {
  switch (type) {
    case "experience":
      experiences.deleteExperience(db, id);
      return;
    case "achievement":
      achievements.deleteAchievement(db, id);
      return;
    case "skill":
      skills.deleteSkill(db, id);
      return;
    case "skill_proof":
      skillProofs.deleteSkillProof(db, id);
      return;
    case "project":
      projects.deleteProject(db, id);
      return;
    case "education":
      education.deleteEducation(db, id);
      return;
    case "certificate":
      certificates.deleteCertificate(db, id);
      return;
    case "language":
      languages.deleteLanguage(db, id);
      return;
  }
}

export function deleteItem(db: Db, type: ProfileItemType, id: number): DeleteResult {
  const item = getItem(db, type, id);
  if (!item) throw notFound(type, id);

  // Find what the cascade will remove, before it is gone.
  const linkedAchievements =
    type === "experience" || type === "project"
      ? achievements.listAchievements(db).filter((a) => (type === "experience" ? a.experience_id : a.project_id) === id)
      : [];
  const linkedProofs =
    type === "skill"
      ? skillProofs.listSkillProofs(db).filter((p) => p.skill_id === id)
      : type === "experience" || type === "project" || type === "education" || type === "certificate"
        ? skillProofs.listSkillProofs(db).filter((p) => {
            const [targetType, targetId] = proofTarget(p);
            return targetType === type && targetId === id;
          })
        : [];

  inTransaction(db, () => deleteRow(db, type, id));

  return {
    deleted: item,
    also_deleted: { achievements: linkedAchievements, skill_proofs: linkedProofs },
    jobs_to_rematch: [],
  };
}

// --- Import (first setup from my CV, see docs/TOOLS.md "profile_import") ---

type ProofKey = "experience_id" | "project_id" | "education_id" | "certificate_id";

function isProfileEmpty(db: Db): boolean {
  const { profile: main, ...items } = getProfileWithItems(db);
  return main === null && Object.values(items).every((list) => list.length === 0);
}

// Saves the whole profile in one go: all of it, or nothing.
// The schema already checked the refs and the duplicate names.
export function importProfile(db: Db, input: ProfileImportInput): ProfileImportResult {
  if (!isProfileEmpty(db)) {
    throw new ConflictError(
      "The profile is not empty. profile_import is only for the first setup: use profile_update and the item tools.",
    );
  }

  return inTransaction(db, () => {
    const counts = {
      experiences: 0,
      achievements: 0,
      projects: 0,
      education: 0,
      certificates: 0,
      skills: 0,
      skill_proofs: 0,
      languages: 0,
    };

    // ref -> the saved item, so skills can point to it.
    const refs = new Map<string, { key: ProofKey; id: number }>();
    const remember = (ref: string | undefined, key: ProofKey, id: number) => {
      if (ref !== undefined) refs.set(ref, { key, id });
    };

    // The order (position) is the place in the list.
    const addAchievements = (
      link: { experience_id: number } | { project_id: number },
      list: { text: string }[] = [],
    ) => {
      list.forEach((achievement, position) => {
        achievements.insertAchievement(db, { type: "achievement", ...link, ...achievement, position }, "imported");
        counts.achievements++;
      });
    };

    profile.insertProfile(db, input.profile);

    for (const { ref, achievements: list, ...fields } of input.experiences) {
      const saved = experiences.insertExperience(db, { type: "experience", ...fields }, "imported");
      remember(ref, "experience_id", saved.id);
      addAchievements({ experience_id: saved.id }, list);
      counts.experiences++;
    }

    for (const { ref, achievements: list, ...fields } of input.projects) {
      const saved = projects.insertProject(db, { type: "project", ...fields }, "imported");
      remember(ref, "project_id", saved.id);
      addAchievements({ project_id: saved.id }, list);
      counts.projects++;
    }

    for (const { ref, ...fields } of input.education) {
      const saved = education.insertEducation(db, { type: "education", ...fields }, "imported");
      remember(ref, "education_id", saved.id);
      counts.education++;
    }

    for (const { ref, ...fields } of input.certificates) {
      const saved = certificates.insertCertificate(db, { type: "certificate", ...fields }, "imported");
      remember(ref, "certificate_id", saved.id);
      counts.certificates++;
    }

    for (const { proven_by = [], ...fields } of input.skills) {
      const saved = skills.insertSkill(db, { type: "skill", ...fields }, "imported");
      counts.skills++;
      // new Set: the same ref twice makes only one proof.
      for (const ref of new Set(proven_by)) {
        const target = refs.get(ref)!; // the schema checked that every ref exists
        const proof: SkillProofCreateInput = { type: "skill_proof", skill_id: saved.id };
        proof[target.key] = target.id;
        skillProofs.insertSkillProof(db, proof, "imported");
        counts.skill_proofs++;
      }
    }

    for (const fields of input.languages) {
      languages.insertLanguage(db, { type: "language", ...fields }, "imported");
      counts.languages++;
    }

    const items = Object.values(counts).reduce((sum, n) => sum + n, 0);
    return {
      counts,
      ids: Object.fromEntries([...refs].map(([ref, { id }]) => [ref, id])),
      not_checked: items + 1, // + the profile row
    };
  });
}

// --- Reset (empty the whole profile) ---

// Deletes the profile and every item, checked or not. It can't be undone.
// After it, profile_import works again.
export function resetProfile(db: Db): ProfileResetResult {
  const all = getProfileWithItems(db);
  inTransaction(db, () => deleteAllProfileRows(db));
  return {
    deleted: {
      profile: all.profile !== null,
      experiences: all.experiences.length,
      achievements: all.achievements.length,
      projects: all.projects.length,
      education: all.education.length,
      certificates: all.certificates.length,
      skills: all.skills.length,
      skill_proofs: all.skill_proofs.length,
      languages: all.languages.length,
    },
  };
}
