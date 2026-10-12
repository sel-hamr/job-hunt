import {
  EXPERIENCE_TYPES,
  LANGUAGE_LEVELS,
  SKILL_CATEGORIES,
  SKILL_LEVELS,
} from "@jobhunt/shared";
import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";

const list = (values: readonly string[]) => values.map((v) => `"${v}"`).join(", ");

// Where the CV comes from: the text box, or a file I attached in the chat.
function cvPart(cvText: string | undefined): string {
  const text = cvText?.trim();
  if (text) return `My CV:\n\n${text}`;
  return "My CV is the file or text I attached in this chat. If there is none, ask me for it and stop.";
}

function portfolioPart(portfolioUrl: string | undefined): string {
  const url = portfolioUrl?.trim();
  if (url) return `My portfolio site: ${url}`;
  return "I gave no portfolio link. If my CV has one, use that link. If there is none, skip the portfolio steps.";
}

function instruction(cvText: string | undefined, portfolioUrl: string | undefined): string {
  return [
    "Set up my job-hunt profile from my CV and my portfolio site, with ONE profile_import call.",
    "",
    cvPart(cvText),
    "",
    portfolioPart(portfolioUrl),
    "",
    "Steps:",
    "1. Read my CV.",
    "2. Open my portfolio site with your web tool, and read my projects, skills and links there.",
    "   If you can't open it, ask me to paste the page text, and wait.",
    "3. Merge both. An item found in both (the same job, project or skill) is saved once.",
    '4. Put the portfolio in profile.links with the label "Portfolio". Add my other links too (GitHub, LinkedIn, ...).',
    "5. Give each job, project, school and certificate a short ref (like \"acme\"),",
    "   and list the refs that prove each skill in its proven_by.",
    "6. Call profile_import once with everything.",
    "   If it is refused with a list of problems, fix all of them and call it again.",
    "   If it says the profile is not empty, stop and tell me. Never reset or delete my profile yourself.",
    "",
    "Rules:",
    "- Use only facts from my CV and my portfolio. Never invent a job, an achievement, a number, a date or a skill.",
    "- Some fields are required but often not in a CV. Only for these, make your best guess:",
    `  - experience_type: one of ${list(EXPERIENCE_TYPES)}`,
    `  - skill level: one of ${list(SKILL_LEVELS)}`,
    `  - skill category: one of ${list(SKILL_CATEGORIES)}`,
    "  Leave every other unknown field out. Don't guess it.",
    '- Dates: "YYYY", "YYYY-MM" or "YYYY-MM-DD". A job I still have has no end_date.',
    '- country: 2 capital letters, like "MA".',
    `- Language level: one of ${list(LANGUAGE_LEVELS)}.`,
    "- Achievements: one short sentence each. Put a number from the text (like \"40%\") in number too.",
    "",
    "Then reply with:",
    "1. a short count of what was saved,",
    "2. every guess you made (which field, which value, and why), so I can check it,",
    "3. the review_link from the profile_import answer, as a clickable link, like:",
    '   "Please review your profile here: <link>".',
    "Everything is saved as not checked. Leave the review to me: only I check my facts, in my browser.",
  ].join("\n");
}

export function registerImportCv(server: McpServer): void {
  server.registerPrompt(
    "import_cv",
    {
      title: "Import my CV",
      description:
        "Set up my profile from my CV and my portfolio site, in one profile_import call. " +
        "Paste the CV text, or leave it empty and attach the CV file in the chat.",
      argsSchema: z.object({
        cv_text: z
          .string()
          .optional()
          .describe("The text of my CV. Leave empty if I attach the CV file in the chat."),
        portfolio_url: z
          .string()
          .optional()
          .describe("My portfolio site, like https://my-site.com (optional)"),
      }),
    },
    ({ cv_text, portfolio_url }) => ({
      messages: [
        {
          role: "user",
          content: { type: "text", text: instruction(cv_text, portfolio_url) },
        },
      ],
    }),
  );
}
