# core (the brain)

Pure logic. **No browser APIs, no React, no `fetch`.** Only plain TypeScript.
So every file here is easy to read, reuse and test later.

Files (not created yet):

| File | Easy meaning |
|---|---|
| `prompt.ts` | The prompt template, and a function that fills it (link, AI fields, original text). |
| `job-fields.ts` | The shape of the `job_add` fields (title, company, city, ...) as a schema. Used for structured outputs and to show the fields. |
| `text.ts` | Small text tools: clean line breaks, count characters, "is this text too short?" (under about 500 characters). |
| `types.ts` | Shared types: the 3 modes, the extract result. |

Rule: **the original text is never changed** here, except safe cleaning (line breaks, extra blank lines).
