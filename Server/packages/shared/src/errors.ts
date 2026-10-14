import { z } from "zod";

// What the admin API answers when something goes wrong. Rules: docs/API.md, part 1.
export const ApiErrorSchema = z.object({
  error: z.string(),
  problems: z.array(z.string()).optional(), // only with 400: every problem at once
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
