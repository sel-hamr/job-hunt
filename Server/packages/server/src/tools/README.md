# tools (the recipes)

What the AI can **do**. One file for each tool.
Tools are grouped by topic, in sub-folders (`profile/`, later `jobs/`, ...).

A tool only:
1. checks the input (the SDK does it with `inputSchema`, a schema from `@jobhunt/shared`),
2. calls a service,
3. returns the answer: a short text for the AI **and** `structuredContent` (checked against `outputSchema`).

No SQL here. No hard work here. No `try / catch` for our errors: the SDK turns a thrown `NotFoundError`, `ConflictError` or `RuleError` into `isError: true` with its message, and the AI sees it.

Every tool gets `app: AppContext` (from `../server.ts`): the open database and the settings it needs.
A tool that changes profile data also returns the review link (`lib/review-link.ts`), and its description tells the AI to show it to me.

`index.ts` adds all tools to the server in one place.

| Tool | File |
|---|---|
| `profile_get` | `profile/get.ts` |
| `profile_update` | `profile/update.ts` |
| `profile_import` | `profile/import.ts` |
| `profile_reset` | `profile/reset.ts` |
