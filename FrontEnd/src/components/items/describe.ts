import type { ProfileItem, ProfileItemType, ProfileWithItems } from "@jobhunt/shared";

export const KIND_LABELS: Record<ProfileItemType, { one: string; many: string }> = {
  experience: { one: "Experience", many: "Experience" },
  achievement: { one: "Achievement", many: "Achievements" },
  skill: { one: "Skill", many: "Skills" },
  skill_proof: { one: "Skill proof", many: "Skill proofs" },
  project: { one: "Project", many: "Projects" },
  education: { one: "Education", many: "Education" },
  certificate: { one: "Certificate", many: "Certificates" },
  language: { one: "Language", many: "Languages" },
};

const dates = (start: string | null, end: string | null, open: string) =>
  start || end ? `${start ?? "?"} – ${end ?? open}` : "";

const join = (...parts: (string | null | undefined | false)[]) => parts.filter(Boolean).join(" · ");

// A short name for an item (used in lists and in the "belongs to" choices).
export function nameOf(item: ProfileItem, data?: ProfileWithItems): string {
  switch (item.type) {
    case "experience":
      return `${item.position} @ ${item.company}`;
    case "achievement":
      return item.text;
    case "skill":
      return item.name;
    case "skill_proof": {
      const skill = data?.skills.find((s) => s.id === item.skill_id);
      return `${skill?.name ?? `Skill ${item.skill_id}`} ← ${proofTargetName(item, data)}`;
    }
    case "project":
      return item.name;
    case "education":
      return `${item.degree}, ${item.school}`;
    case "certificate":
      return item.name;
    case "language":
      return item.language;
  }
}

function proofTargetName(
  proof: Extract<ProfileItem, { type: "skill_proof" }>,
  data?: ProfileWithItems,
): string {
  const target =
    (proof.experience_id != null && data?.experiences.find((e) => e.id === proof.experience_id)) ||
    (proof.project_id != null && data?.projects.find((p) => p.id === proof.project_id)) ||
    (proof.education_id != null && data?.education.find((e) => e.id === proof.education_id)) ||
    (proof.certificate_id != null && data?.certificates.find((c) => c.id === proof.certificate_id));
  return target ? nameOf(target) : "?";
}

// The second line: the facts that are not in the name.
export function detailsOf(item: ProfileItem, data?: ProfileWithItems): string {
  switch (item.type) {
    case "experience":
      return join(
        item.experience_type,
        item.remote ? "remote" : item.city,
        dates(item.start_date, item.end_date, "now"),
      );
    case "achievement": {
      const parent =
        item.experience_id != null
          ? data?.experiences.find((e) => e.id === item.experience_id)
          : data?.projects.find((p) => p.id === item.project_id);
      // Only the job or project it belongs to: the text is the name.
      return parent ? nameOf(parent) : "";
    }
    case "skill":
      return join(item.category, item.level, item.other_names.length > 0 && `also: ${item.other_names.join(", ")}`);
    case "skill_proof":
      return item.experience_id != null
        ? "proven by a job"
        : item.project_id != null
          ? "proven by a project"
          : item.education_id != null
            ? "proven by education"
            : "proven by a certificate";
    case "project":
      return join(item.role, dates(item.start_date, item.end_date, "?"));
    case "education":
      return join(item.field, item.grade, dates(item.start_date, item.end_date, "?"));
    case "certificate":
      return join(item.issuer, item.date, item.expires && `expires ${item.expires}`);
    case "language":
      return item.level;
  }
}
