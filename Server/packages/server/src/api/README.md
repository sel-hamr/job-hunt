# api (the dashboard counter)

The admin API for the dashboard (`/api/...`). Like the tools, but for a web page instead of an AI.
The list of addresses: `docs/API.md`.

A route only:
1. checks the input (schemas from `@jobhunt/shared`),
2. calls a service (**the same services as the tools**),
3. returns JSON.

No SQL here. No hard work here.

Errors: a route never catches. It lets `.parse()` and the services throw, and `errors.ts` turns the error into the answer: Zod or `RuleError` -> 400 (with `problems`), `NotFoundError` -> 404, `ConflictError` -> 409. Express 5 passes thrown errors on by itself.

| File | What |
|---|---|
| `index.ts` | `createApiRouter(app)`: adds every route and the error handler. Mounted at `/api` in `transports/http.ts`. |
| `errors.ts` | Service errors -> HTTP answers. |
| `profile.ts` | `/api/profile`. |
| `review.ts` | `/api/review`: the only addresses that set `checked = 1`. |

`GET /api/stats` is one line, so it lives in `index.ts`. `jobs.ts` comes with build step 2.
