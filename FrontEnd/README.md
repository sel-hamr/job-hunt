# FrontEnd (the dashboard)

My admin dashboard for Job Hunt. I see my numbers, edit my profile, check imported items, and look at my jobs.

Status: building. Done (2026-10-14): the app shell, **Review**, **Home** and **Profile**. Jobs comes with build step 2 (the page says so for now).

## How it fits

```
Browser  ->  Next.js (server side)  ->  Server admin API (/api)  ->  services  ->  SQLite
```

- The dashboard **never opens the database.** It reads and changes data only through the server's **admin API** (`/api/...`).
- The admin API calls the **same services** as the MCP tools, so all the rules (quote check, proofs, ...) stay in one place.
- API list: `Server/docs/API.md`.

## Decisions

| Topic | Decision |
|---|---|
| Data | Through the server's **admin API** (`/api/...`), next to `/mcp`. Never SQLite directly. |
| Pages in v1 | **Home**, **Profile**, **Review**, **Jobs**. Other pages (Companies, Documents, Learning, Gap report, Settings) come when their server step exists. |
| Login | **None.** Only me, on my own computer. |
| Checking items | The **Review** page is where I check items (`checked = yes`). No MCP tool can do it. |
| Where it runs | On my computer: `http://localhost:3000`. The server API listens on `127.0.0.1` only. |
| Stack | **Next.js (App Router)** + TypeScript + **Tailwind** + **shadcn/ui**. |
| Look | **Paper Mono** (decided on 2026-10-13): Space Mono only, ink outlines, square corners, one mustard action and one hard shadow per view. Light only. Rules and the new-page checklist: `DESIGN.md`. |
| Reading data | **Server Components** call the API on the Next.js side. Browser JavaScript never calls the API. |
| Changing data | **Server Actions** (add, edit, delete, check, skip). |
| Forms | shadcn Field pieces + react-hook-form + **Zod**. |
| Tables | shadcn **Table**. The lists are short, so no sort or pages yet. TanStack Table (installed) comes with the Jobs list. |
| Charts | shadcn **Charts** (Recharts) on Home. |
| Data shapes | Shared package **`@jobhunt/shared`** (`Server/packages/shared/`), with Zod schemas used by both the server and the dashboard. Linked with `"@jobhunt/shared": "file:../Server/packages/shared"`, `transpilePackages` and `turbopack.root` (the repo root, so Turbopack can follow the link) in `next.config.ts`. |

## Pages (v1)

| Page | Address | What I see and do |
|---|---|---|
| Home | `/` | Jobs saved, fit labels (chart), items waiting for my check, top 5 missing skills. |
| Profile | `/profile` | My info + every item kind (experiences, achievements, skills, projects, education, certificates, languages). Add, edit, delete. |
| Review | `/review` | Items with `checked = no`. Read -> **Check**, or fix then check. |
| Jobs | `/jobs` | Job list with filters (fit label, skipped). |
| Job | `/jobs/[id]` | Requirements, match results with proofs, fit label. Skip / un-skip, edit fields. |

## Folders

Rules for AI agents: `AGENTS.md`. The look: `DESIGN.md`. Each folder has its own `README.md`.

```
FrontEnd/
├── DESIGN.md            the look + checklist for a new page
├── docs/design/         the reference picture
├── public/              images, favicon
└── src/
    ├── app/             pages (routes) only
    │   └── (dashboard)/ layout with the rail + Home, profile/, review/, jobs/
    ├── features/        one folder per topic: home/, profile/, review/, jobs/
    ├── components/      shared pieces: ui/ (shadcn/ui), layout/ (rail, top bar), items/ (item forms)
    └── lib/             api/ (the only code that calls the server), action-result
```

## Run it

1. Start the server's HTTP door from `Server/`, with `TRANSPORT=http` (in `packages/server/.env`, or in the shell: `TRANSPORT=http npm run dev`). It needs `AUTH_TOKEN` (32+ characters). `/api` listens on `http://127.0.0.1:3001`.
2. In `FrontEnd/`, make `.env.local` (never committed) with `JOBHUNT_API_URL=http://127.0.0.1:3001`. Without it, the dashboard uses that same address.
3. `npm run dev`, then open `http://localhost:3000`.

If the server is not running, each page shows "Can't reach the server" and a Retry button.
