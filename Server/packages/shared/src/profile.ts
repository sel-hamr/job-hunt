import { z } from "zod";
import {
  CheckFieldsSchema,
  CountryCodeSchema,
  CvDateSchema,
  cvDateIsBefore,
  HttpUrlSchema,
  IdSchema,
  LinkSchema,
  TimestampSchema,
} from "./common.ts";

// The profile and every profile item. Rules: docs/SHARED.md, part 7.
// Each item kind has 3 shapes:
// - XSchema: a saved item, as the server sends it.
// - XCreateInputSchema: what you send to add one. No id, check fields or timestamps.
// - XUpdateInputSchema: what you send to change one. Every field optional, no defaults
//   (a default would overwrite the saved value), at least one field needed.

// Choice lists. They must match the CHECK lists in 001_profile.sql word for word.
export const EXPERIENCE_TYPES = ["full-time", "part-time", "intern", "freelance", "volunteer"] as const;
export const SKILL_CATEGORIES = ["language", "framework", "tool", "soft skill"] as const;
export const SKILL_LEVELS = ["beginner", "good", "expert"] as const;
export const LANGUAGE_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2", "native"] as const;
export const PROFILE_ITEM_TYPES = [
  "experience",
  "achievement",
  "skill",
  "skill_proof",
  "project",
  "education",
  "certificate",
  "language",
] as const;
export const ProfileItemTypeSchema = z.enum(PROFILE_ITEM_TYPES);
export type ProfileItemType = z.infer<typeof ProfileItemTypeSchema>;

const Text = z.string().trim().min(1);
const OptionalText = Text.nullable();
const OptionalCvDate = CvDateSchema.nullable();

// Fields the server sets on every saved item.
const savedFields = {
  id: IdSchema,
  ...CheckFieldsSchema.shape,
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
};

// --- Shape rules (they need only the item itself) ---

const hasAnyField = (v: Record<string, unknown>) =>
  Object.entries(v).some(([key, value]) => key !== "type" && value !== undefined);
const AT_LEAST_ONE = { message: "Send at least one field to change" };

const countSet = (...ids: (number | null | undefined)[]) => ids.filter((id) => id != null).length;

const endNotBeforeStart = (v: { start_date?: string | null; end_date?: string | null }) =>
  !v.start_date || !v.end_date || !cvDateIsBefore(v.end_date, v.start_date);
const END_NOT_BEFORE_START = { message: "end_date can't be before start_date", path: ["end_date"] };

// --- Profile (always 1 row) ---

const profileFields = {
  name: Text,
  headline: OptionalText,
  email: z.email().nullable(),
  phone: OptionalText,
  city: OptionalText,
  country: CountryCodeSchema.nullable(),
  summary: OptionalText,
  links: z.array(LinkSchema),
};

export const ProfileSchema = z.object({
  id: z.literal(1),
  ...profileFields,
  checked: z.boolean(),
  checked_at: TimestampSchema.nullable(),
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
});
export type Profile = z.infer<typeof ProfileSchema>;

export const ProfileUpdateInputSchema = z.object(profileFields).partial().refine(hasAnyField, AT_LEAST_ONE);
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateInputSchema>;

// --- Experience ---

const experienceFields = {
  company: Text,
  position: Text,
  type: z.enum(EXPERIENCE_TYPES),
  city: OptionalText,
  remote: z.boolean(),
  start_date: CvDateSchema,
  end_date: OptionalCvDate, // null = still working there
  summary: OptionalText,
};
// "type" is the item kind, so the job type is sent as "experience_type" in the item union.
const { type: experienceType, ...experienceRest } = experienceFields;
const experienceItemFields = { ...experienceRest, experience_type: experienceType };

export const ExperienceSchema = z
  .object({ type: z.literal("experience"), ...savedFields, ...experienceItemFields })
  .refine(endNotBeforeStart, END_NOT_BEFORE_START);
export type Experience = z.infer<typeof ExperienceSchema>;

export const ExperienceCreateInputSchema = z
  .object({ type: z.literal("experience"), ...experienceItemFields })
  .partial({ city: true, remote: true, end_date: true, summary: true })
  .refine(endNotBeforeStart, END_NOT_BEFORE_START);
export type ExperienceCreateInput = z.infer<typeof ExperienceCreateInputSchema>;

export const ExperienceUpdateInputSchema = z
  .object({ type: z.literal("experience"), ...z.object(experienceItemFields).partial().shape })
  .refine(hasAnyField, AT_LEAST_ONE)
  .refine(endNotBeforeStart, END_NOT_BEFORE_START);
export type ExperienceUpdateInput = z.infer<typeof ExperienceUpdateInputSchema>;

// --- Achievement (in a job OR a project) ---

const achievementLinkFields = {
  experience_id: IdSchema.nullable(),
  project_id: IdSchema.nullable(),
};
const achievementFields = {
  text: Text,
  number: OptionalText, // like "40%", so the number can be checked
  position: z.number().int().min(0), // order in the list
};
const oneAchievementLink = (v: { experience_id?: number | null; project_id?: number | null }) =>
  countSet(v.experience_id, v.project_id) === 1;
const ONE_ACHIEVEMENT_LINK = { message: "Give exactly one of experience_id or project_id" };

export const AchievementSchema = z
  .object({ type: z.literal("achievement"), ...savedFields, ...achievementLinkFields, ...achievementFields })
  .refine(oneAchievementLink, ONE_ACHIEVEMENT_LINK);
export type Achievement = z.infer<typeof AchievementSchema>;

export const AchievementCreateInputSchema = z
  .object({ type: z.literal("achievement"), ...achievementLinkFields, ...achievementFields })
  .partial({ experience_id: true, project_id: true, number: true })
  .refine(oneAchievementLink, ONE_ACHIEVEMENT_LINK);
export type AchievementCreateInput = z.infer<typeof AchievementCreateInputSchema>;

// The link can't change: to move an achievement, delete it and add it again.
export const AchievementUpdateInputSchema = z
  .object({ type: z.literal("achievement"), ...z.object(achievementFields).partial().shape })
  .refine(hasAnyField, AT_LEAST_ONE);
export type AchievementUpdateInput = z.infer<typeof AchievementUpdateInputSchema>;

// --- Skill ---

const skillFields = {
  name: Text,
  other_names: z.array(Text), // like ["Node", "NodeJS"], used by the ATS check
  category: z.enum(SKILL_CATEGORIES),
  level: z.enum(SKILL_LEVELS),
};

export const SkillSchema = z.object({ type: z.literal("skill"), ...savedFields, ...skillFields });
export type Skill = z.infer<typeof SkillSchema>;

export const SkillCreateInputSchema = z
  .object({ type: z.literal("skill"), ...skillFields })
  .partial({ other_names: true });
export type SkillCreateInput = z.infer<typeof SkillCreateInputSchema>;

export const SkillUpdateInputSchema = z
  .object({ type: z.literal("skill"), ...z.object(skillFields).partial().shape })
  .refine(hasAnyField, AT_LEAST_ONE);
export type SkillUpdateInput = z.infer<typeof SkillUpdateInputSchema>;

// --- Skill proof (which item proves a skill) ---

const skillProofFields = {
  skill_id: IdSchema,
  experience_id: IdSchema.nullable(),
  project_id: IdSchema.nullable(),
  education_id: IdSchema.nullable(),
  certificate_id: IdSchema.nullable(),
};
const oneProofItem = (v: {
  experience_id?: number | null;
  project_id?: number | null;
  education_id?: number | null;
  certificate_id?: number | null;
}) => countSet(v.experience_id, v.project_id, v.education_id, v.certificate_id) === 1;
const ONE_PROOF_ITEM = {
  message: "Give exactly one of experience_id, project_id, education_id or certificate_id",
};

export const SkillProofSchema = z
  .object({ type: z.literal("skill_proof"), ...savedFields, ...skillProofFields })
  .refine(oneProofItem, ONE_PROOF_ITEM);
export type SkillProof = z.infer<typeof SkillProofSchema>;

export const SkillProofCreateInputSchema = z
  .object({ type: z.literal("skill_proof"), ...skillProofFields })
  .partial({ experience_id: true, project_id: true, education_id: true, certificate_id: true })
  .refine(oneProofItem, ONE_PROOF_ITEM);
export type SkillProofCreateInput = z.infer<typeof SkillProofCreateInputSchema>;

// A proof has nothing to change: delete it and add a new one. So it has no update input.

// --- Project ---

const projectFields = {
  name: Text,
  role: OptionalText,
  description: OptionalText,
  links: z.array(LinkSchema),
  start_date: OptionalCvDate,
  end_date: OptionalCvDate,
};

export const ProjectSchema = z
  .object({ type: z.literal("project"), ...savedFields, ...projectFields })
  .refine(endNotBeforeStart, END_NOT_BEFORE_START);
export type Project = z.infer<typeof ProjectSchema>;

export const ProjectCreateInputSchema = z
  .object({ type: z.literal("project"), ...projectFields })
  .partial({ role: true, description: true, links: true, start_date: true, end_date: true })
  .refine(endNotBeforeStart, END_NOT_BEFORE_START);
export type ProjectCreateInput = z.infer<typeof ProjectCreateInputSchema>;

export const ProjectUpdateInputSchema = z
  .object({ type: z.literal("project"), ...z.object(projectFields).partial().shape })
  .refine(hasAnyField, AT_LEAST_ONE)
  .refine(endNotBeforeStart, END_NOT_BEFORE_START);
export type ProjectUpdateInput = z.infer<typeof ProjectUpdateInputSchema>;

// --- Education ---

const educationFields = {
  school: Text,
  degree: Text,
  field: OptionalText,
  start_date: OptionalCvDate,
  end_date: OptionalCvDate,
  grade: OptionalText,
};

export const EducationSchema = z
  .object({ type: z.literal("education"), ...savedFields, ...educationFields })
  .refine(endNotBeforeStart, END_NOT_BEFORE_START);
export type Education = z.infer<typeof EducationSchema>;

export const EducationCreateInputSchema = z
  .object({ type: z.literal("education"), ...educationFields })
  .partial({ field: true, start_date: true, end_date: true, grade: true })
  .refine(endNotBeforeStart, END_NOT_BEFORE_START);
export type EducationCreateInput = z.infer<typeof EducationCreateInputSchema>;

export const EducationUpdateInputSchema = z
  .object({ type: z.literal("education"), ...z.object(educationFields).partial().shape })
  .refine(hasAnyField, AT_LEAST_ONE)
  .refine(endNotBeforeStart, END_NOT_BEFORE_START);
export type EducationUpdateInput = z.infer<typeof EducationUpdateInputSchema>;

// --- Certificate ---

const certificateFields = {
  name: Text,
  issuer: Text,
  date: CvDateSchema,
  expires: OptionalCvDate,
  link: HttpUrlSchema.nullable(), // a link to check the certificate
};
const expiresNotBeforeDate = (v: { date?: string; expires?: string | null }) =>
  !v.date || !v.expires || !cvDateIsBefore(v.expires, v.date);
const EXPIRES_NOT_BEFORE_DATE = { message: "expires can't be before date", path: ["expires"] };

export const CertificateSchema = z
  .object({ type: z.literal("certificate"), ...savedFields, ...certificateFields })
  .refine(expiresNotBeforeDate, EXPIRES_NOT_BEFORE_DATE);
export type Certificate = z.infer<typeof CertificateSchema>;

export const CertificateCreateInputSchema = z
  .object({ type: z.literal("certificate"), ...certificateFields })
  .partial({ expires: true, link: true })
  .refine(expiresNotBeforeDate, EXPIRES_NOT_BEFORE_DATE);
export type CertificateCreateInput = z.infer<typeof CertificateCreateInputSchema>;

export const CertificateUpdateInputSchema = z
  .object({ type: z.literal("certificate"), ...z.object(certificateFields).partial().shape })
  .refine(hasAnyField, AT_LEAST_ONE)
  .refine(expiresNotBeforeDate, EXPIRES_NOT_BEFORE_DATE);
export type CertificateUpdateInput = z.infer<typeof CertificateUpdateInputSchema>;

// --- Language ---

const languageFields = {
  language: Text,
  level: z.enum(LANGUAGE_LEVELS),
};

export const LanguageSchema = z.object({ type: z.literal("language"), ...savedFields, ...languageFields });
export type Language = z.infer<typeof LanguageSchema>;

export const LanguageCreateInputSchema = z.object({ type: z.literal("language"), ...languageFields });
export type LanguageCreateInput = z.infer<typeof LanguageCreateInputSchema>;

export const LanguageUpdateInputSchema = z
  .object({ type: z.literal("language"), ...z.object(languageFields).partial().shape })
  .refine(hasAnyField, AT_LEAST_ONE);
export type LanguageUpdateInput = z.infer<typeof LanguageUpdateInputSchema>;

// --- Any item, picked by "type" ---

export const ProfileItemSchema = z.discriminatedUnion("type", [
  ExperienceSchema,
  AchievementSchema,
  SkillSchema,
  SkillProofSchema,
  ProjectSchema,
  EducationSchema,
  CertificateSchema,
  LanguageSchema,
]);
export type ProfileItem = z.infer<typeof ProfileItemSchema>;

export const ProfileItemCreateInputSchema = z.discriminatedUnion("type", [
  ExperienceCreateInputSchema,
  AchievementCreateInputSchema,
  SkillCreateInputSchema,
  SkillProofCreateInputSchema,
  ProjectCreateInputSchema,
  EducationCreateInputSchema,
  CertificateCreateInputSchema,
  LanguageCreateInputSchema,
]);
export type ProfileItemCreateInput = z.infer<typeof ProfileItemCreateInputSchema>;

export const ProfileItemUpdateInputSchema = z.discriminatedUnion("type", [
  ExperienceUpdateInputSchema,
  AchievementUpdateInputSchema,
  SkillUpdateInputSchema,
  ProjectUpdateInputSchema,
  EducationUpdateInputSchema,
  CertificateUpdateInputSchema,
  LanguageUpdateInputSchema,
]);
export type ProfileItemUpdateInput = z.infer<typeof ProfileItemUpdateInputSchema>;

// --- The answer of GET /api/profile ---

export const ProfileWithItemsSchema = z.object({
  profile: ProfileSchema.nullable(), // null until the profile is first saved
  experiences: z.array(ExperienceSchema),
  achievements: z.array(AchievementSchema),
  skills: z.array(SkillSchema),
  skill_proofs: z.array(SkillProofSchema),
  projects: z.array(ProjectSchema),
  education: z.array(EducationSchema),
  certificates: z.array(CertificateSchema),
  languages: z.array(LanguageSchema),
});
export type ProfileWithItems = z.infer<typeof ProfileWithItemsSchema>;
