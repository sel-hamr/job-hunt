import {
  EXPERIENCE_TYPES,
  LANGUAGE_LEVELS,
  SKILL_CATEGORIES,
  SKILL_LEVELS,
  type ProfileItemType,
  type ProfileWithItems,
} from "@jobhunt/shared";
import { nameOf } from "./describe";

// The form fields of each kind, in the order they show. The shapes and rules
// themselves live in @jobhunt/shared: the form checks with those schemas.

export type FormKind = ProfileItemType | "profile";

export type FieldInput =
  | "text"
  | "long"
  | "email"
  | "url"
  | "date"
  | "choice"
  | "flag"
  | "order"
  | "names"
  | "links"
  // Links to other items. They are set when the item is added and never change.
  | "parent"
  | "skill"
  | "proof_target";

export type FieldSpec = {
  name: string;
  label: string;
  input: FieldInput;
  required?: boolean;
  choices?: readonly string[];
  hint?: string;
};

const DATE_HINT = "YYYY, YYYY-MM or YYYY-MM-DD";

export const FIELDS: Record<FormKind, FieldSpec[]> = {
  profile: [
    { name: "name", label: "Name", input: "text", required: true },
    { name: "headline", label: "Headline", input: "text" },
    { name: "email", label: "Email", input: "email" },
    { name: "phone", label: "Phone", input: "text" },
    { name: "city", label: "City", input: "text" },
    { name: "country", label: "Country", input: "text", hint: "2 capital letters, like MA" },
    { name: "summary", label: "Summary", input: "long" },
    { name: "links", label: "Links", input: "links", hint: "One per line: Label | https://..." },
  ],
  experience: [
    { name: "company", label: "Company", input: "text", required: true },
    { name: "position", label: "Position", input: "text", required: true },
    { name: "experience_type", label: "Job type", input: "choice", required: true, choices: EXPERIENCE_TYPES },
    { name: "city", label: "City", input: "text" },
    { name: "start_date", label: "Start", input: "date", required: true, hint: DATE_HINT },
    { name: "end_date", label: "End", input: "date", hint: "Empty = I still work there" },
    { name: "remote", label: "Remote", input: "flag" },
    { name: "summary", label: "Summary", input: "long" },
  ],
  achievement: [
    { name: "parent", label: "Belongs to", input: "parent", required: true },
    { name: "text", label: "Text", input: "long", required: true },
    { name: "position", label: "Order in the list", input: "order", required: true, hint: "0 = first" },
  ],
  skill: [
    { name: "name", label: "Name", input: "text", required: true },
    { name: "category", label: "Category", input: "choice", required: true, choices: SKILL_CATEGORIES },
    { name: "level", label: "Level", input: "choice", required: true, choices: SKILL_LEVELS },
    { name: "other_names", label: "Other names", input: "names", hint: "Comma separated, like Node, NodeJS" },
  ],
  skill_proof: [
    { name: "skill", label: "Skill", input: "skill", required: true },
    { name: "proof_target", label: "Proven by", input: "proof_target", required: true },
  ],
  project: [
    { name: "name", label: "Name", input: "text", required: true },
    { name: "role", label: "My role", input: "text" },
    { name: "start_date", label: "Start", input: "date", hint: DATE_HINT },
    { name: "end_date", label: "End", input: "date", hint: DATE_HINT },
    { name: "description", label: "Description", input: "long" },
    { name: "links", label: "Links", input: "links", hint: "One per line: Label | https://..." },
  ],
  education: [
    { name: "school", label: "School", input: "text", required: true },
    { name: "degree", label: "Degree", input: "text", required: true },
    { name: "field", label: "Field", input: "text" },
    { name: "grade", label: "Grade", input: "text" },
    { name: "start_date", label: "Start", input: "date", hint: DATE_HINT },
    { name: "end_date", label: "End", input: "date", hint: DATE_HINT },
  ],
  certificate: [
    { name: "name", label: "Name", input: "text", required: true },
    { name: "issuer", label: "Issuer", input: "text", required: true },
    { name: "date", label: "Date", input: "date", required: true, hint: DATE_HINT },
    { name: "expires", label: "Expires", input: "date", hint: DATE_HINT },
    { name: "link", label: "Link to check it", input: "url" },
  ],
  language: [
    { name: "language", label: "Language", input: "text", required: true },
    { name: "level", label: "Level", input: "choice", required: true, choices: LANGUAGE_LEVELS },
  ],
};

const LINK_INPUTS: FieldInput[] = ["parent", "skill", "proof_target"];
export const isLinkField = (field: FieldSpec) => LINK_INPUTS.includes(field.input);

// Which form field a schema key belongs to (the link fields hold several keys).
export function fieldForKey(key: string): string {
  if (key === "experience_id" || key === "project_id") return "parent";
  if (key === "skill_id") return "skill";
  if (key === "education_id" || key === "certificate_id") return "proof_target";
  return key;
}

// --- The choices for the link fields ---

export type Choice = { value: string; label: string };
export type LinkChoices = { parents: Choice[]; skills: Choice[]; targets: Choice[] };

export function linkChoicesFrom(data: ProfileWithItems): LinkChoices {
  const jobs = data.experiences.map((e) => ({ value: `experience:${e.id}`, label: `Job: ${nameOf(e)}` }));
  const projects = data.projects.map((p) => ({ value: `project:${p.id}`, label: `Project: ${nameOf(p)}` }));
  return {
    parents: [...jobs, ...projects],
    skills: data.skills.map((s) => ({ value: String(s.id), label: s.name })),
    targets: [
      ...jobs,
      ...projects,
      ...data.education.map((e) => ({ value: `education:${e.id}`, label: `Education: ${nameOf(e)}` })),
      ...data.certificates.map((c) => ({ value: `certificate:${c.id}`, label: `Certificate: ${nameOf(c)}` })),
    ],
  };
}

// --- Form values (text) <-> the shape the API takes ---

export type FormValues = Record<string, string | boolean>;

// What the form starts with: the saved values as text, or empty.
export function formValuesFrom(fields: FieldSpec[], saved?: Record<string, unknown> | null): FormValues {
  const values: FormValues = {};
  for (const field of fields) {
    const value = saved?.[field.name];
    switch (field.input) {
      case "flag":
        values[field.name] = value === true;
        break;
      case "order":
        values[field.name] = value == null ? "0" : String(value);
        break;
      case "names":
        values[field.name] = Array.isArray(value) ? value.join(", ") : "";
        break;
      case "links":
        values[field.name] = Array.isArray(value)
          ? value.map((link: { label: string; url: string }) => `${link.label} | ${link.url}`).join("\n")
          : "";
        break;
      default:
        values[field.name] = value == null ? "" : String(value);
    }
  }
  return values;
}

function parseLinks(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const bar = line.indexOf("|");
      if (bar === -1) return { label: "Link", url: line };
      return { label: line.slice(0, bar).trim(), url: line.slice(bar + 1).trim() };
    });
}

// One field's typed value. An empty optional field is null (in an update, null clears it).
function readField(field: FieldSpec, raw: string | boolean | undefined): unknown {
  switch (field.input) {
    case "flag":
      return raw === true;
    case "order":
      return raw === "" || raw === undefined ? undefined : Number(raw);
    case "names":
      return String(raw ?? "")
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);
    case "links":
      return parseLinks(String(raw ?? ""));
    default: {
      const text = String(raw ?? "").trim();
      if (text === "") return field.required ? "" : null;
      return text;
    }
  }
}

// The input for the API. Add: every filled field. Change: only the fields that changed.
export function payloadFrom(
  kind: FormKind,
  fields: FieldSpec[],
  values: FormValues,
  mode: "create" | "update",
  saved: FormValues,
): Record<string, unknown> {
  const payload: Record<string, unknown> = kind === "profile" ? {} : { type: kind };
  for (const field of fields) {
    if (isLinkField(field)) {
      const raw = String(values[field.name] ?? "");
      if (mode === "update" || raw === "") continue;
      if (field.input === "skill") {
        payload.skill_id = Number(raw);
      } else {
        const [type, id] = raw.split(":");
        payload[`${type}_id`] = Number(id);
      }
      continue;
    }
    const value = readField(field, values[field.name]);
    if (mode === "create") {
      if (value !== null && value !== undefined) payload[field.name] = value;
    } else if (JSON.stringify(value) !== JSON.stringify(readField(field, saved[field.name]))) {
      payload[field.name] = value;
    }
  }
  return payload;
}
