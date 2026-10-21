import {
  ProfileItemCreateInputSchema,
  ProfileItemSchema,
  SourceSchema,
} from "@jobhunt/shared";
import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import { reviewLink } from "../../lib/review-link.ts";
import type { AppContext } from "../../server.ts";
import { addItem } from "../../services/profile.ts";

// The link is in the structured answer too: some apps give the AI only this part.
const OutputSchema = z.object({
  item: ProfileItemSchema,
  review_link: z.url(),
});

export function registerProfileItemAdd(
  server: McpServer,
  app: AppContext,
): void {
  server.registerTool(
    "profile_item_add",
    {
      title: "Add one profile item",
      description: [
        "Add one item to my profile: a job (experience), an achievement, a",
        "skill, a skill proof, a project, education, a certificate or a",
        "language. Put the fields in `item`, with `item.type` set to the kind.",
        "",
        "- An achievement belongs to exactly one job or project:",
        "  give experience_id OR project_id.",
        "- A skill proof links a skill to exactly one job, project, education",
        "  or certificate that proves it.",
        "- Dates are YYYY, YYYY-MM or YYYY-MM-DD.",
        "",
        "Not for the first setup from a CV (use profile_import) and not for",
        "my name or contact info (use profile_update).",
        "",
        "I don't know any ids: I name things (\"my Acme job\", \"the Shop",
        "project\"). Call profile_get first, find the id by that name, and",
        "check the item isn't there already. If two items fit the name, ask me",
        "which one by name and dates. Never ask me for an id.",
        "",
        "The new item is NOT checked: it can't be used for job matching or",
        "CVs until I confirm it. The answer has a `review_link`.",
        "",
        "After a successful save, end your reply to me with the `review_link`",
        'exactly as given, as a clickable link, like "Please review it here:',
        "<link>\". Always show the link: I can't see the tool answer. Leave the",
        "review to me: only I check my facts, in my browser.",
      ].join("\n"),
      inputSchema: z.object({
        item: ProfileItemCreateInputSchema,
        source: SourceSchema.default("manual").describe(
          '"imported" if it comes from a CV or other file, "manual" if I told you',
        ),
      }),
      outputSchema: OutputSchema,
      annotations: { readOnlyHint: false, idempotentHint: false },
    },
    async ({ item, source }) => {
      const saved = addItem(app.db, item, source);
      const result = {
        item: saved,
        review_link: reviewLink(app.dashboardUrl, saved.type, saved.id),
      };
      return {
        content: [
          { type: "text", text: JSON.stringify(result, null, 2) },
          {
            type: "text",
            text: `Saved. It is NOT checked yet. Review it: ${result.review_link}`,
          },
        ],
        structuredContent: result,
      };
    },
  );
}
