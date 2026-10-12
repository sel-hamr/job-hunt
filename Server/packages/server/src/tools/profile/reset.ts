import {
  PROFILE_RESET_CONFIRM,
  ProfileResetInputSchema,
  ProfileResetResultSchema,
} from "@jobhunt/shared";
import type { McpServer } from "@modelcontextprotocol/server";
import type { AppContext } from "../../server.ts";
import { resetProfile } from "../../services/profile.ts";

export function registerProfileReset(
  server: McpServer,
  app: AppContext,
): void {
  server.registerTool(
    "profile_reset",
    {
      title: "Delete my whole profile",
      description: [
        "DANGER: delete my whole profile and every item (jobs, achievements,",
        "projects, education, certificates, skills, proofs, languages),",
        "checked or not. It can't be undone.",
        "",
        "Use it ONLY when I clearly ask to reset or empty my profile, for",
        "example to run profile_import again. Never use it to fix a mistake:",
        "use profile_update and the item tools for that.",
        "",
        `Send confirm: "${PROFILE_RESET_CONFIRM}".`,
      ].join("\n"),
      inputSchema: ProfileResetInputSchema,
      outputSchema: ProfileResetResultSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
      },
    },
    async () => {
      const result = resetProfile(app.db);
      return {
        content: [
          { type: "text", text: JSON.stringify(result, null, 2) },
          {
            type: "text",
            text: "Deleted. The profile is empty now, so profile_import can be used again.",
          },
        ],
        structuredContent: result,
      };
    },
  );
}
