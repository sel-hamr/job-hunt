import { z } from "zod";
import { IdSchema } from "./common.ts";
import {
  ProfileItemSchema,
  ProfileItemTypeSchema,
  ProfileItemUpdateInputSchema,
  ProfileSchema,
  ProfileUpdateInputSchema,
} from "./profile.ts";

// The Review page: where I check items (checked = true). Rules: docs/SHARED.md, part 7,
// and docs/DATABASE.md, part 12. The profile row is not an item kind, so it has its own
// target: { type: "profile" }, with no id (there is only one profile).

// --- What waits for my check (GET /api/review) ---

export const ReviewEntrySchema = z.object({
  item: ProfileItemSchema,
  summary: z.string(), // one line to read, made by the server (a proof names its skill and its item)
});
export type ReviewEntry = z.infer<typeof ReviewEntrySchema>;

export const ReviewGroupSchema = z.object({
  key: z.string(), // stable, like "experience-3" or "skills"
  title: z.string(), // like "Backend Developer @ Acme"
  entries: z.array(ReviewEntrySchema),
});
export type ReviewGroup = z.infer<typeof ReviewGroupSchema>;

export const ReviewListSchema = z.object({
  profile: ProfileSchema.nullable(), // only when it waits for a check
  groups: z.array(ReviewGroupSchema),
  total: z.number().int().min(0), // items + the profile
});
export type ReviewList = z.infer<typeof ReviewListSchema>;

// --- Check (POST /api/review/check) ---

export const ReviewTargetSchema = z.union([
  z.object({ type: z.literal("profile") }),
  z.object({ type: ProfileItemTypeSchema, id: IdSchema }),
]);
export type ReviewTarget = z.infer<typeof ReviewTargetSchema>;

export const CheckInputSchema = z.object({
  items: z.array(ReviewTargetSchema).min(1).max(50),
});
export type CheckInput = z.infer<typeof CheckInputSchema>;

export const CheckResultSchema = z.object({
  profile: ProfileSchema.nullable(), // set when the profile was in the list
  items: z.array(ProfileItemSchema),
});
export type CheckResult = z.infer<typeof CheckResultSchema>;

// --- Fix and check (POST /api/review/fix) ---

// A fix I make here stays checked, because I made it. A skill proof has nothing to fix.
export const FixInputSchema = z.union([
  z.object({ type: z.literal("profile"), changes: ProfileUpdateInputSchema }),
  z.object({ id: IdSchema, changes: ProfileItemUpdateInputSchema }), // changes.type names the kind
]);
export type FixInput = z.infer<typeof FixInputSchema>;

export const FixResultSchema = z.union([ProfileSchema, ProfileItemSchema]);
export type FixResult = z.infer<typeof FixResultSchema>;
