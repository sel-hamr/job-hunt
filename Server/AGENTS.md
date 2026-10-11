# Job Hunt MCP: guide for AI agents

Read this first. More rules are in `packages/server/AGENTS.md` and `packages/agent/AGENTS.md`.

## What this project is

Two programs in one repo:

- `packages/server/`: an **MCP server** (the "kitchen"). It owns the SQLite database and offers tools over **stdio** and **Streamable HTTP**.
- `packages/agent/`: an **AI agent** (the "waiter"). It uses Claude, has its own tools, and calls the server's tools through MCP. **Optional, built last, only if the user asks.** The server works fully without it, in Claude Desktop, VS Code or Claude Code.

```
User -> Agent -> MCP Server -> SQLite
```

Plus one shared package and two apps outside this folder:

- `packages/shared/`: **`@jobhunt/shared`**, data shapes (Zod schemas) used by the server and the dashboard.
- `Job Hunt/FrontEnd/`: the **dashboard** (Next.js). It uses the server's **admin API** (`/api`), never the database. Rules: `FrontEnd/AGENTS.md`.
- `Job Hunt/Extension/`: the **browser extension**. It only builds a prompt to copy. It never talks to the server. Rules: `Extension/AGENTS.md`.

**What the product does, and all product decisions:** read `docs/PRODUCT.md`.
**All tables, columns and database rules:** read `docs/DATABASE.md`. If you change the database, update that file in the same change.
**All MCP tools and prompts:** read `docs/TOOLS.md`. If you add or change a tool, update that file in the same change.
**All admin API addresses (for the dashboard):** read `docs/API.md`. If you add or change an address, update that file in the same change.
**All shared data shapes (`@jobhunt/shared`):** read `docs/SHARED.md`. If you add or change a shape, update that file in the same change.
The most important product rule: **never invent facts.** Every fact in a CV or cover letter needs a proof link to a profile item that the user has **checked** (`checked = yes`).

## Current status

**This list is the source of truth for progress.** Update it in the same PR that finishes a step.
Build steps are from `docs/PRODUCT.md` ("Build order"). We are in **build step 1: Profile**.

### Done (2026-10-11)

- Setup: npm workspaces, TypeScript, Node runs `.ts` directly (no build step), Zod.
- Database: config (`DB_PATH`, `DASHBOARD_URL`), `connection.ts`, `migrate.ts`, `001_profile.sql` (9 profile tables).
- `@jobhunt/shared`: `common.ts`, `profile.ts` (all profile shapes).
- Repositories for the profile and all 8 item kinds; `services/profile.ts` (edit = not checked, clear errors, date and duplicate rules).
- MCP over stdio (SDK v2): `profile_get`, `profile_update` (answers with the review link). Works in Claude Desktop.

### Next, in this order

1. **`profile_import`**: `ProfileImportInputSchema` in `shared` → import service (one transaction, empty profile only, all problems listed at once) → tool. Plan: `docs/TOOLS.md`, "`profile_import` input".
2. **`import_cv` prompt**: CV + portfolio site → merge → guess missing required fields and list the guesses → `profile_import` once.
3. **HTTP door** (`transports/http.ts`): `/mcp` with the MCP token, `/api`, `/health`, `Host` / `Origin` checks, `127.0.0.1` only.
4. **Login**: `users` and `sessions` tables (migration `002`), the create-user script, `/api/auth/*`. Plan: `docs/DATABASE.md` part 7c, `docs/API.md`.
5. **`/api/profile` and `/api/review`** (list, check, fix). `/api/review/*` is the only way to set `checked = 1`.
6. **Dashboard** (`FrontEnd/`): login page and the **Review page** first, then Home and Profile.
7. **`review_items`** tool: count + link to the Review page.
8. **`profile_item_add` / `profile_item_update` / `profile_item_delete`** tools, each answering with its review link.
9. **Skill years** in `profile_get` (counted from the dates of checked proofs, overlaps once).

After step 1 is done: build step 2 (Jobs + match), see `docs/PRODUCT.md`.

## How to work here

- **The user writes the code by hand.** Explain one small step at a time and **suggest** code in the chat. Don't create or edit source files unless the user clearly asks. Review the user's code when asked.
- If the user says "plan", "planning" or "no code", do **not** write code. Only discuss, or edit docs.
- Before you add a file, read the `README.md` in that folder. Put code where the README says.
- If you add a folder, add a `README.md` to it in the same easy style.
- If you change the structure or a rule, update this file and the matching README.
- Talk to the user in **simple English**: short sentences, no hard words.
- Ask the user first before you move or delete files, add a dependency, or change an existing migration.

## Architecture rules (always follow)

1. **Only `packages/server/src/db/` talks to SQLite.** Only `db/connection.ts` imports `node:sqlite`.
2. **The agent and the dashboard never open the database.** The agent uses the server's MCP tools. The dashboard uses the admin API (`/api`).
3. **Tools are defined once**, in the server factory (`server.ts`). Transports only connect. They have no job-hunt logic.
4. **Layers, in this order:** tool (or API route) -> service -> repository.
   - Tool / API route: checks the input and calls a service. Tools and API routes use **the same services**.
   - Service: the real logic. No MCP types inside.
   - Repository: all SQL. SQL lives nowhere else.
5. **Where does a new tool go?** If any AI app (Claude Desktop, VS Code, the agent) should use it, it goes in the server. If only the agent needs it, it goes in the agent.
6. **stdout belongs to the stdio connection.** The server must never print to stdout. Log to stderr only, so no `console.log` in server code.

## Facts that changed (your training data may be old)

- **MCP TypeScript SDK v2** is the stable line since 2026-07-27. Use `@modelcontextprotocol/server` and `@modelcontextprotocol/node`, not v1 `@modelcontextprotocol/sdk`. Read the docs in `github.com/modelcontextprotocol/typescript-sdk` (`docs/`) before you write SDK code. Do not guess API names.
- **v2 HTTP is stateless.** The handler builds a new server for every request. So open the database **once** at startup and pass it into the server factory. Never open the database inside the factory.
- **The v2 HTTP handler does not check `Host`, `Origin` or tokens.** We do that ourselves in `transports/http.ts`. Bind to `127.0.0.1` by default.
- **`node:sqlite`** in Node 24 exports `DatabaseSync`. Node 26 renames it to `Database` and keeps `DatabaseSync` as a deprecated alias. The API is synchronous, and its stability level is "release candidate".
- **Claude models:** `claude-opus-5-5` is the default. Use `claude-haiku-5-5` for cheap bulk work.

## Tech

- Node.js >= 24 (dev machine: 24.21), TypeScript, ESM (`"type": "module"`).
- Validation: Zod v4.
- The root `package.json` holds what every package uses: dev tools (`typescript`, `@types/node`) and `zod`. A dependency only one package uses goes in that package's `package.json`.
- `@jobhunt/shared` lists `zod` as a **peer dependency** (see `docs/SHARED.md`). Keep one Zod version (`^4.6.5`) everywhere, the dashboard too.
- No tests for now.
- **No build step.** Node 24 runs the `.ts` files directly (type stripping), in dev and in Claude Desktop. `tsc` only checks types (`noEmit`).
- **Imports end in `.ts`**, the real file name: `import { openDb } from "./db/connection.ts"`. A `.js` ending passes the type check but crashes when Node runs.
- **Only erasable TypeScript** (`erasableSyntaxOnly`): no `enum`, no `namespace`, no constructor parameter properties. Use `as const` objects or unions instead of `enum`.
- The dev machine runs Windows, and the path has a space (`Job Hunt`). Always quote paths.

## Commands

Run these from `Server/`:

| Command | What it does |
|---|---|
| `npm install` | Installs everything and links the workspace packages. |
| `npm run dev` | Runs the server with `node --watch` and restarts it when you save a file. Reads `packages/server/.env`. |
| `npm start` | Runs the server once, the same way Claude Desktop will. |
| `npm run typecheck` | Checks the types in every package. Prints nothing when there are no errors. |

Claude Desktop runs `node <full path>/Server/packages/server/src/index.ts` and passes settings in its own `env` block.
