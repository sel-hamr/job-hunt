# FrontEnd (the dashboard)

My admin dashboard for Job Hunt. I log in, see my numbers, edit my profile, check imported items, and look at my jobs.

Status: planning (decided on 2026-10-10). No code yet.

## How it fits

```
Browser  ->  Next.js (server side)  ->  Server admin API (/api)  ->  services  ->  SQLite
                 holds the session          checks the session
                 cookie (httpOnly)
```

- The dashboard **never opens the database.** It reads and changes data only through the server's **admin API** (`/api/...`).
- The admin API calls the **same services** as the MCP tools, so all the rules (quote check, proofs, ...) stay in one place.
- API list: `Server/docs/API.md`.

## Decisions

| Topic | Decision |
|---|---|
| Data | Through the server's **admin API** (`/api/...`), next to `/mcp`. Never SQLite directly. |
| Pages in v1 | **Home**, **Profile**, **Review**, **Jobs**. Other pages (Companies, Documents, Learning, Gap report, Settings) come when their server step exists. |
| Login | **Email + password**, only in the dashboard (not in the extension). **One user** (me), made once with a server script. No sign-up page. |
| Who checks the login | **The server.** `POST /api/auth/login` checks the password (scrypt hash) and makes a **session** (7 days). Next.js keeps it in an `httpOnly` cookie and sends it with every API call. Logout deletes the session. |
| Login safety | One error message ("Wrong email or password"). Wait 1 minute after 5 wrong tries. |
| Checking items | The **Review** page is where I check items (`checked = yes`). Only a valid session can do it, and the AI never has one. |
| Where it runs | On my computer: `http://localhost:3000`. The server API listens on `127.0.0.1` only. |
| Stack | **Next.js (App Router)** + TypeScript + **Tailwind** + **shadcn/ui** (same look as the extension). |
| Reading data | **Server Components** call the API on the Next.js side. The session never reaches browser JavaScript. |
| Changing data | **Server Actions** (add, edit, delete, check, skip). |
| Forms | shadcn Field pieces + react-hook-form + **Zod**. |
| Tables | shadcn **Data Table** (TanStack Table): sort, filter, pages. |
| Charts | shadcn **Charts** (Recharts) on Home. |
| Data shapes | Shared package **`@jobhunt/shared`** (`Server/packages/shared/`), with Zod schemas used by both the server and the dashboard. Linked with `"@jobhunt/shared": "file:../Server/packages/shared"` and `transpilePackages` in `next.config.ts`. |

## Pages (v1)

| Page | Address | What I see and do |
|---|---|---|
| Login | `/login` | Email + password. |
| Home | `/` | Jobs saved, fit labels (chart), items waiting for my check, top 5 missing skills. |
| Profile | `/profile` | My info + every item kind (experiences, achievements, skills, projects, education, certificates, languages). Add, edit, delete. |
| Review | `/review` | Items with `checked = no`. Read -> **Check**, or fix then check. |
| Jobs | `/jobs` | Job list with filters (fit label, skipped). |
| Job | `/jobs/[id]` | Requirements, match results with proofs, fit label. Skip / un-skip, edit fields. |

## Folders

Rules for AI agents: `AGENTS.md`. Each folder has its own `README.md`.

```
FrontEnd/
├── public/              images, favicon
└── src/
    ├── proxy.ts         sends me to /login when there's no session cookie
    ├── app/             pages (routes) only
    │   ├── (auth)/login/
    │   └── (dashboard)/ layout with sidebar + Home, profile/, review/, jobs/
    ├── features/        one folder per topic: auth/, home/, profile/, review/, jobs/
    ├── components/      shared pieces: ui/ (shadcn/ui), layout/ (sidebar, header)
    └── lib/             api/ (the only code that calls the server), session/, utils
```
