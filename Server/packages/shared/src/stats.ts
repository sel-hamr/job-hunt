import { z } from "zod";

// The numbers for the dashboard's Home page (GET /api/stats). Rules: docs/SHARED.md, part 7.
// Until jobs exist (build step 2), the job numbers are 0 and the missing skills are empty.

const Count = z.number().int().min(0);

export const MissingSkillSchema = z.object({
  keyword: z.string(),
  jobs: Count, // how many jobs ask for it
  must_have: Count, // in how many of them it is a must-have
});
export type MissingSkill = z.infer<typeof MissingSkillSchema>;

export const StatsSchema = z.object({
  jobs_total: Count,
  jobs_by_fit: z.object({ good_fit: Count, some_gaps: Count, big_gaps: Count, not_matched: Count }),
  unchecked_items: Count, // the profile row counts too
  top_missing_skills: z.array(MissingSkillSchema).max(5),
});
export type Stats = z.infer<typeof StatsSchema>;
