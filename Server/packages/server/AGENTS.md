# Server: rules for AI agents

Also follow the root `AGENTS.md`.

## The two transports

- One codebase, two transports. The `--transport stdio|http` flag picks one, and the default is `stdio`.
- HTTP settings: `--port`, `--host` (default `127.0.0.1`) and `--auth-token` (or the `AUTH_TOKEN` env var).
- HTTP endpoints: `/mcp` for MCP, `/api/...` for the dashboard's admin API (see `docs/API.md`), and `/health` for a health check.
- HTTP security lives only in `src/transports/http.ts`: check the bearer token on `/mcp`, the **session** on `/api` (every address except login), the `Host` header and the `Origin` header.
- `/mcp` and `/api` use **different secrets**: the MCP token for AI apps, a login session for the dashboard. An AI app never gets a session, so it can never set `checked = 1` through the API.
- `/api` sends **no CORS headers**, so browser pages can't call it directly. Only the Next.js server does.
- In stdio mode, any text on stdout breaks the protocol. Log to stderr.

## Startup order (`src/index.ts`)

1. Read and check the config (`src/config/`).
2. Open the database once (`src/db/connection.ts`).
3. Run migrations (`src/db/migrate.ts`).
4. Start the chosen transport and pass it the server factory from `src/server.ts`. The factory receives the database as an argument.
5. On SIGINT or SIGTERM, close the transport and then the database.

## Database rules

- On open, set `journal_mode=WAL`, `foreign_keys=ON` and a `busy_timeout`. The stdio and HTTP servers may use the same file at the same time.
- Migrations are numbered `.sql` files in `src/db/migrations/` (`001_...sql`, `002_...sql`). `PRAGMA user_version` tracks which ones have run.
- **Never edit an old migration.** Add a new one.
- **No MCP tool may set `checked = 1`.** Only `POST /api/review/check` and `/fix`, with my login session (the dashboard's Review page), can. `review_items` only returns a link. When the AI edits a checked item, set `checked = 0`. See `docs/DATABASE.md`, part 12.
- The API is synchronous, so keep each query small and fast. A slow query blocks the whole server.
- The default database file is `data/jobs.sqlite`, and `DB_PATH` can change it. Never commit the file.

## Checklist: adding a new tool

1. Add the input/output shape in `src/schemas/`.
2. Add any SQL to a file in `src/db/repositories/`.
3. Put the logic in a file in `src/services/`.
4. Add the tool file in `src/tools/<topic>/`. It checks the input with the schema and calls the service.
5. Register the tool in `src/tools/index.ts`.
6. Write a clear tool description. The AI reads it to decide when to use the tool.
