import {
  IdSchema,
  ProfileItemSchema,
  ProfileItemUpdateInputSchema,
} from "@jobhunt/shared";
import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import { reviewLink } from "../../lib/review-link.ts";
import type { AppContext } from "../../server.ts";
import { updateItem } from "../../services/profile.ts";

// The link is in the structured answer too: some apps give the AI only this part.
const OutputSchema = z.object({
  item: ProfileItemSchema,
  review_link: z.url(),
});

export function registerProfileItemUpdate(
  server: McpServer,
  app: AppContext,
): void {
  server.registerTool(
    "profile_item_update",
    {
      title: "Change one profile item",
      description: [
        "Change one item of my profile. Give its `id`, and in `changes` its",
        "kind (`changes.type`) and only the fields to change.",
        "",
        "Skill proofs can't be changed: delete the proof and add a new one.",
        "An achievement can't move to another job or project: delete it and",
        "add it again. Not for my name or contact info (use profile_update).",
        "",
        "I don't know any ids: I name things (\"my Acme job\", \"the Node.js",
        "skill\"). Call profile_get first and find the id by that name. If two",
        "items fit the name, ask me which one by name and dates. Never ask me",
        "for an id.",
        "",
        "Every change makes the item NOT checked again: it can't be used for",
        "job matching or CVs until I confirm it. The answer has a",
        "`review_link`.",
        "",
        "After a successful save, reply with a short list of what changed, and",
        "end with the `review_link` exactly as given, as a clickable link.",
        "Always show the link: I can't see the tool answer. Leave the review",
        "to me: only I check my facts, in my browser.",
      ].join("\n"),
      inputSchema: z.object({
        id: IdSchema.describe("The id of the item to change"),
        changes: ProfileItemUpdateInputSchema,
      }),
      outputSchema: OutputSchema,
      annotations: { readOnlyHint: false, idempotentHint: true },
    },
    async ({ id, changes }) => {
      const saved = updateItem(app.db, id, changes);
      const result = {
        item: saved,
        review_link: reviewLink(app.dashboardUrl, saved.type, saved.id),
      };
      return {
        content: [
          { type: "text", text: JSON.stringify(result, null, 2) },
          {
            type: "text",
            text: `Saved. It is NOT checked anymore. Review this change: ${result.review_link}`,
          },
        ],
        structuredContent: result,
      };
    },
  );
}
