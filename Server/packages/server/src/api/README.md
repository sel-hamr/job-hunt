# api (the dashboard counter)

The admin API for the dashboard (`/api/...`). Like the tools, but for a web page instead of an AI.
The list of addresses: `docs/API.md`.

A route only:
1. checks the input (schemas from `@jobhunt/shared`),
2. calls a service (**the same services as the tools**),
3. returns JSON.

No SQL here. No hard work here.

Files (later): one per topic, `auth.ts`, `stats.ts`, `profile.ts`, `review.ts`, `jobs.ts`, plus `index.ts` that adds them all.
The session check happens before any route runs (in `transports/http.ts`, with the auth service).
