import { ProfileImportInputSchema, ProfileImportResultSchema } from "@jobhunt/shared";
import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import { reviewLink } from "../../lib/review-link.ts";
import type { AppContext } from "../../server.ts";
import { importProfile } from "../../services/profile.ts";

// The link is in the structured answer too: some apps give the AI only this part.
const OutputSchema = ProfileImportResultSchema.extend({
  review_link: z.url(),
});

export function registerProfileImport(
  server: McpServer,
  app: AppContext,
): void {
  server.registerTool(
    "profile_import",
    {
      title: "Import my profile from my CV",
      description: [
        "First setup only: save my whole profile from my CV and portfolio in",
        "one call. Works only when the profile is empty. All or nothing.",
        "",
        "Give an item a short `ref` (like \"acme\") when a skill points to it",
        "with `proven_by`. If the import is refused, all problems are listed",
        "at once: fix them all and call again.",
        "",
        "Everything is saved NOT checked: it can't be used for job matching",
        "or CVs until I confirm it. The answer has a `review_link`.",
        "",
        "After a successful import, end your reply to me with:",
        "1. a short count of what was saved, and any fields you had to guess,",
        "2. the `review_link` exactly as given, as a clickable link, like:",
        '   "Please review your profile here: <link>".',
        "Always show the link: I can't see the tool answer. Leave the review",
        "to me: only I check my facts, in my browser.",
      ].join("\n"),
      inputSchema: ProfileImportInputSchema,
      outputSchema: OutputSchema,
      annotations: { readOnlyHint: false, idempotentHint: false },
    },
    async (input) => {
      const result = {
        ...importProfile(app.db, input),
        review_link: reviewLink(app.dashboardUrl),
      };
      return {
        content: [
          { type: "text", text: JSON.stringify(result, null, 2) },
          {
            type: "text",
            text: `Saved. ${result.not_checked} things are NOT checked yet. Review them: ${result.review_link}`,
          },
        ],
        structuredContent: result,
      };
    },
  );
}
