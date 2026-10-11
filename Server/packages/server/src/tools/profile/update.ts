import { ProfileSchema, ProfileUpdateInputSchema } from "@jobhunt/shared";
import type { McpServer } from "@modelcontextprotocol/server";
import { reviewLink } from "../../lib/review-link.ts";
import type { AppContext } from "../../server.ts";
import { updateProfile } from "../../services/profile.ts";

export function registerProfileUpdate(
  server: McpServer,
  app: AppContext,
): void {
  server.registerTool(
    "profile_update",
    {
      title: "Update my profile",
      description:
        "Save or change the main profile: name, headline, email, phone, city, country (2 letters, like MA), " +
        "summary and links. Send only the fields to change. The first save needs a name. " +
        "Any change makes the profile not checked. After saving, always show me the review link " +
        "from the answer, so I can check the change.",
      inputSchema: ProfileUpdateInputSchema,
      outputSchema: ProfileSchema,
      annotations: { readOnlyHint: false, idempotentHint: true },
    },
    async (changes) => {
      const profile = updateProfile(app.db, changes);
      const link = reviewLink(app.dashboardUrl, "profile");
      return {
        content: [
          { type: "text", text: JSON.stringify(profile, null, 2) },
          {
            type: "text",
            text: `Saved. The profile is now NOT checked. Review this change: ${link}`,
          },
        ],
        structuredContent: profile,
      };
    },
  );
}
