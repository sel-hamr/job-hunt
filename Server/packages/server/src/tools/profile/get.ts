import { ProfileWithItemsSchema } from "@jobhunt/shared";
import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import type { AppContext } from "../../server.ts";
import { getProfileWithItems } from "../../services/profile.ts";

export function registerProfileGet(server: McpServer, app: AppContext): void {
  server.registerTool(
    "profile_get",
    {
      title: "Get my profile",
      description:
        "Read my whole profile: contact info, jobs, achievements, skills, skill proofs, projects, " +
        "education, certificates and languages. Each item has `checked`: true means I confirmed it. " +
        "Use only_checked: true before matching a job or writing a CV, so only confirmed facts are used.",
      inputSchema: z.object({
        only_checked: z
          .boolean()
          .default(false)
          .describe("true = only the facts I have checked"),
      }),
      outputSchema: ProfileWithItemsSchema,
      annotations: { readOnlyHint: true },
    },
    async ({ only_checked }) => {
      const profile = getProfileWithItems(app.db, {
        onlyChecked: only_checked,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(profile, null, 2) }],
        structuredContent: profile,
      };
    },
  );
}
