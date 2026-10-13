# Job Hunt

My personal job-hunt toolkit: save my profile once, match it to job posts, and write CVs and cover letters using **only true, checked facts**.

It has three parts that work together: an **MCP server**, a **Next.js dashboard** and a **browser extension**.

1. I save my profile once: experience, skills, education, certificates and projects.
2. I save a job post.
3. The tools check the match: for each requirement, do I have it? **Yes**, **partly** or **no**, with proof.
4. The tools write a CV and a cover letter for that job, using **only true facts** from my profile.

Status: **building step 1 (Profile)**. The server's database, profile rules and first MCP tools (`profile_get`, `profile_update`) work. What's done and what's next: [`Server/AGENTS.md`](Server/AGENTS.md#current-status).

## The main rule: never invent facts

- Every fact in a CV or cover letter needs a **proof link** to a profile item that I have **checked** (`checked = yes`).
- Every job requirement needs an **exact quote** from the job text. The server rejects quotes that aren't in the text.
- A missing skill is **never** added to the CV. It shows as a **gap** in the match report.
- I still read every document before I send it.

## The parts

| Folder | What it is | Stack |
|---|---|---|
| [`Server/`](Server/) | The **MCP server**. It owns the SQLite database. It gives tools to AI apps (`/mcp`) and an admin API to the dashboard (`/api`). **It has no AI and no API key.** | Node.js 24+, TypeScript, MCP SDK v2, `node:sqlite`, Zod |
| [`FrontEnd/`](FrontEnd/) | The **dashboard**. I see my numbers, edit my profile, check imported items and look at my jobs. | Next.js (App Router), Tailwind, shadcn/ui |
| [`Extension/`](Extension/) | A **browser extension**. It turns the job page I have open into one prompt that I copy into Claude. | WXT, React, Tailwind, shadcn/ui |

Inside `Server/packages/`:

| Package | Job |
|---|---|
| `server/` | The MCP server itself (stdio + Streamable HTTP). |
| `shared/` | `@jobhunt/shared`: data shapes (Zod schemas) used by the server and the dashboard. |
| `agent/` | An optional Claude agent that runs the whole flow with one command. Built last, only if needed. |

## How it fits

```
Claude Desktop / VS Code / Claude Code  ->  /mcp  --+
                                                    +-->  Server (services)  ->  SQLite
Dashboard (Next.js, localhost:3000)     ->  /api  --+

Browser extension  ->  a prompt I copy  ->  paste into Claude
```

- **Only the server touches the database.** The dashboard uses the admin API, and the agent uses MCP tools.
- The MCP tools and the admin API call **the same services**, so every rule lives in one place.
- The AI app (Claude) writes the text. The server gives data and writing rules, checks the proofs, and saves the results.
- The extension never talks to the server. Its optional AI mode uses my own Claude API key, stored only in the browser.
- Everything runs on my computer. The server listens on `127.0.0.1` only.

## Docs

| File | What's inside |
|---|---|
| [`Server/docs/PRODUCT.md`](Server/docs/PRODUCT.md) | The idea, every product decision and the build order. **Start here.** |
| [`Server/docs/DATABASE.md`](Server/docs/DATABASE.md) | All tables, columns and database rules (source of truth). |
| [`Server/docs/TOOLS.md`](Server/docs/TOOLS.md) | All MCP tools and prompts (source of truth). |
| [`Server/docs/API.md`](Server/docs/API.md) | All admin API addresses used by the dashboard (source of truth). |
| [`FrontEnd/README.md`](FrontEnd/README.md) | Dashboard plan: pages and data flow. |
| [`Extension/README.md`](Extension/README.md) | Extension plan: modes, prompt template and API key. |

Every folder has its own `README.md` that explains its job. Rules for AI coding agents are in each part's `AGENTS.md`.

## Build order

1. **Profile**: tables, tools, the `import_cv` prompt. Dashboard: Home, Profile, Review.
2. **Jobs + match**: companies and contacts, requirements, match report, gap report. Dashboard: Jobs.
3. **Learning plan**, built on the gap report.
4. **CV + cover letter**: proof check, version history, "sounds human" check, ATS keyword check.
5. **PDF export**: our own ATS PDF, then an optional Canva version.
6. **The agent** (optional, later).

Each step works on its own. The extension can be built any time, but it needs step 2 to be useful.

## Getting started

There are no run commands for the server or the extension yet. They will be listed here when they exist.

Needs **Node.js 24 or newer** (for `node:sqlite`).

Install the dependencies of every part (`Server/`, `FrontEnd/`, `Extension/`) with one command, from the repo root:

```bash
npm run setup
```

The dashboard scaffold can already run:

```bash
cd FrontEnd
npm install
npm run dev     # http://localhost:3000
```

## Not planned

Anything after I apply (status tracker, interview prep), auto-apply bots, job scraping, Word files, many users, and languages other than English. Full list in [`PRODUCT.md`](Server/docs/PRODUCT.md#not-planned-we-decided-not-to-build-these).
