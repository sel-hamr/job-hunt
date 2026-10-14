# FrontEnd (the dashboard)

My admin dashboard for Job Hunt. I see my numbers, edit my profile, check imported items, and look at my jobs.

Status: planning (decided on 2026-10-10). No code yet.

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
| Tables | shadcn **Data Table** (TanStack Table): sort, filter, pages. |
| Charts | shadcn **Charts** (Recharts) on Home. |
| Data shapes | Shared package **`@jobhunt/shared`** (`Server/packages/shared/`), with Zod schemas used by both the server and the dashboard. Linked with `"@jobhunt/shared": "file:../Server/packages/shared"` and `transpilePackages` in `next.config.ts`. |

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
    │   └── (dashboard)/ layout with sidebar + Home, profile/, review/, jobs/
    ├── features/        one folder per topic: home/, profile/, review/, jobs/
    ├── components/      shared pieces: ui/ (shadcn/ui), layout/ (sidebar, header)
    └── lib/             api/ (the only code that calls the server), utils
```
