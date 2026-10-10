# lib/api

The **only** code that calls the server's admin API.

- Every file starts with `import "server-only"`, so it can never run in the browser.
- The server address comes from `.env.local` (`JOBHUNT_API_URL`, for example `http://127.0.0.1:3001`). Never commit `.env.local`.
- Sends the session as `Authorization: Bearer <session>`.
- Checks every answer with the Zod schemas from `@jobhunt/shared`.
- One small file per topic: `auth.ts`, `stats.ts`, `profile.ts`, `review.ts`, `jobs.ts`.
- Errors: **401** -> go to `/login`. **400** -> show the server's list of problems in the form. Other errors -> a clear message.

The list of addresses: `Server/docs/API.md`.
