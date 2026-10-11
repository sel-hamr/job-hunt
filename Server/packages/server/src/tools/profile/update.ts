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
      description: [
        "Save or change my main profile: name, headline, email, phone, city,",
        "country (2 letters, like MA), summary and links. Send only the fields",
        "to change. The first save needs a name.",
        "",
        "Every change makes the profile NOT checked: it can't be used for job",
        "matching or CVs until I confirm it. The answer contains a review link",
        "(it ends with /review?type=profile).",
        "",
        "After a successful save, end your reply to me with:",
        "1. a short list of what changed,",
        "2. the review link exactly as given, as a clickable link, like:",
        '   "Please review this change here: <link>".',
        "Leave the review to me: only I check my facts, in my browser.",
      ].join("\n"),
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
