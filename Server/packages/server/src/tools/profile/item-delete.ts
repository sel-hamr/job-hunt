import {
  AchievementSchema,
  IdSchema,
  ProfileItemSchema,
  ProfileItemTypeSchema,
  SkillProofSchema,
} from "@jobhunt/shared";
import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import type { AppContext } from "../../server.ts";
import { deleteItem } from "../../services/profile.ts";

// The same answer as DELETE /api/profile/items/:type/:id (docs/API.md).
const OutputSchema = z.object({
  deleted: ProfileItemSchema,
  also_deleted: z.object({
    achievements: z.array(AchievementSchema),
    skill_proofs: z.array(SkillProofSchema),
  }),
  jobs_to_rematch: z.array(IdSchema),
});

export function registerProfileItemDelete(
  server: McpServer,
  app: AppContext,
): void {
  server.registerTool(
    "profile_item_delete",
    {
      title: "Delete one profile item",
      description: [
        "DANGER: delete one item of my profile, checked or not. It can't be",
        "undone. Deleting a job or project also deletes its achievements and",
        "skill proofs. Deleting a skill, education or certificate also deletes",
        "its skill proofs.",
        "",
        "Use it only when I ask to remove something, or to move an achievement",
        "or replace a skill proof (delete, then add again). To fix a mistake",
        "in an item, use profile_item_update.",
        "",
        "I don't know any ids: I name things (\"my Acme job\"). Call",
        "profile_get first and find the id by that name. If two items fit the",
        "name, ask me which one by name and dates. Never ask me for an id.",
        "",
        "After a successful delete, tell me what was deleted, including",
        "everything in `also_deleted`, and any `jobs_to_rematch`.",
      ].join("\n"),
      inputSchema: z.object({
        type: ProfileItemTypeSchema.describe("The kind of item"),
        id: IdSchema.describe("The id of the item to delete"),
      }),
      outputSchema: OutputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
      },
    },
    async ({ type, id }) => {
      const result = deleteItem(app.db, type, id);
      const { achievements, skill_proofs } = result.also_deleted;
      return {
        content: [
          { type: "text", text: JSON.stringify(result, null, 2) },
          {
            type: "text",
            text: `Deleted. Also deleted with it: ${achievements.length} achievements and ${skill_proofs.length} skill proofs.`,
          },
        ],
        structuredContent: result,
      };
    },
  );
}
