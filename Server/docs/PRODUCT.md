# Product plan: Job Hunt MCP

Status: building step 1 (Profile). Progress and next steps: `AGENTS.md`, "Current status".

## The idea

1. **I save my profile once**: experience, skills, education, certificates and portfolio projects.
2. **I paste a job post.**
3. **The tools check the match**: for each requirement, do I have it? Yes, partly or no, with proof.
4. **The tools write a CV and a cover letter for that job**, using **only true facts** from my profile.

## Decisions

| Topic | Decision |
|---|---|
| Missing skill | **Never add it to the CV.** Show it as a "gap" in the match report. |
| Who writes the text | **The AI app** (Claude Desktop, VS Code or our agent). The server has no AI and no API key. It gives data and writing rules, and it saves the results. |
| Job input | **Paste the text.** No links in version 1 (many sites block robots). Or use the **browser extension**, which turns the job page I have open into a ready prompt that I copy and paste (see "Browser extension"). |
| Output | **Markdown** saved in the database. Later: **our own ATS PDF** plus an optional **pretty Canva version** (see "Final files"). |
| First profile | **Import my old CV.** The AI reads it and saves each part with tools, then I check and fix it. |
| Profile shape | **Small pieces.** Each experience, skill, project and degree is its own row. |
| Lie guard | **Proof links + server check.** Every fact in a CV or letter points to a profile item. The server rejects facts with no valid proof. I still read everything before I send it. |
| Proof scope | **Facts only** (skills, jobs, dates, numbers, results). Motivation sentences need no proof. |
| Match result | **A list per requirement**: must-have or nice-to-have, then Yes / Partly / No with proof, plus a short honest summary. |
| Requirements | **Saved as rows.** I can fix them, re-run the match later, and see which skills I miss most often. |
| Checked items | After the CV import, every item is `checked = no`. **Only items I marked `checked = yes` can be used as proof.** |
| Who can check | **Only me**, on the **Review page in the dashboard** (needs my login, which the AI never has). In any AI app, `review_items` gives me the link. If the AI edits a checked item, it becomes not checked again. Details: [DATABASE.md](DATABASE.md), part 12. |
| Portfolio | **Links + text** (GitHub, website). No files in version 1. |
| Language | **English only** for now. |
| History | **Keep every version** of each CV and letter, linked to the job, and mark which one I sent. **A saved document never changes.** A change creates a new version. |
| Extra lie checks | When a document is saved, the server also runs a **number check** (every number needs a claim with proof) and a **skill check** (no skill that isn't checked in my profile). Details: [DATABASE.md](DATABASE.md), part 8. |
| Users | **Only me.** The MCP door (`/mcp`) is protected by one token. The **dashboard has a login** (email + password, one user made by a script, no sign-up). The extension has no login. |
| CV style | **1-2 pages, ATS-friendly**: simple layout, clear headings, no tables or pictures. Use job keywords only when they are true. |

## Bonus feature: gap report ("what should I learn next?")

The requirements of every job are saved as rows, so we can count across **all** jobs:

- Which skills do jobs ask for most?
- Which of those do I **not** have (or only partly have)?
- How many must-have requirements would I meet if I learned skill X?

Example:

```
Skills I miss most (last 30 jobs):
  1. Kubernetes   - 14 jobs (9 as must-have)
  2. AWS          - 11 jobs (6 as must-have)
  3. GraphQL      -  7 jobs (1 as must-have)
```

- This is **plain SQL**, so it needs no AI, it's fast, and it gives the same answer every time.
- When I learn a skill and add it to my profile, I can **re-run the match** on saved jobs and see which ones I now fit.
- Server tool: `gap_report` (filters: last N jobs, date range, must-have only).

## Extra features (all happen before I apply)

### 1. ATS keyword check

Job-site robots (ATS) look for keywords. After a CV is written, compare its text with the job's keywords and requirements.

The result has 3 groups:
- **In the CV**: good.
- **Missing, but I have it**: the skill is in my profile with proof, so **add it to the CV**.
- **Missing, and I don't have it**: a real gap. **Do not add it.** It's already in the match report.

```
ATS check for job #12:
  In CV:            Node.js, REST API, SQL
  Missing (true):   Docker -> you have it (project "Job Hunt MCP"), add it
  Missing (gap):    Kubernetes -> do not add
```

- Plain text matching, so it needs no AI.
- Server tool: `ats_check` (document + job).

### 2. "Sounds human" check

Recruiters often distrust text that sounds AI-written.

- **Writing rules** in the prompts: simple, direct sentences, real details, no empty praise.
- A **banned phrases list** that I can edit. Examples: "I am thrilled to...", "fast-paced environment", "proven track record", "leverage synergies".
- When a document is saved, the server looks for banned phrases and **warns** me. It does not reject the document, so I decide.

### 3. Company + contact notes

- Save notes about each **company**: what they do, their product, why I like them, the website.
- Save **contacts**: name, role, email, LinkedIn, and which company they belong to.
- A job links to its company.
- The cover letter may use these notes to be personal. **Truth rule here too:** the letter only says things about the company that are in my notes. Each company fact links to a note, just like proofs.

### 4. Learning plan (grows from the bonus gap report)

- I pick skills from the gap report and add them to my learning plan.
- Each item has: skill, status (`planned` -> `learning` -> `done`), start date, target date, links to courses or docs, and notes.
- **Learning is not having.** A skill in the learning plan **never** counts in the match or the CV.
- When an item becomes `done`, the server tells me to add the skill to my profile **with proof** (a project or certificate), then re-run the match on saved jobs.

## Dashboard (my admin page)

Full plan: [`FrontEnd/README.md`](../../FrontEnd/README.md) (folder `Job Hunt/FrontEnd/`). Addresses: [API.md](API.md).

- A **Next.js** web page on my computer (`localhost:3000`), with **email + password login**.
- **v1 pages:** Home (numbers and charts), Profile (add, edit, delete my info), Review (**check** imported items), Jobs (list + job page, skip).
- It uses the server's **admin API** (`/api`), which calls the **same services** as the MCP tools. It never opens the database.
- The server checks the login and keeps **sessions**. The AI apps never get a session, so the AI can't check items through the dashboard.
- Data shapes are shared with the server through `@jobhunt/shared` (`packages/shared/`).
- More pages (Companies, Documents, Learning, Gap report, Settings) come with their server step.

## Browser extension (job input helper)

Full plan: [`Extension/README.md`](../../Extension/README.md) (folder `Job Hunt/Extension/`).

- On a job page, I click the extension. It builds **one prompt** and I copy it into Claude. Claude then runs `job_add` and `requirements_set`.
- 3 modes: **selected text**, **full page** (Mozilla Readability main content) and **AI** (fills the `job_add` fields).
- **The extension has AI, the server still doesn't.** The extension's AI mode calls the Claude API (`claude-haiku-5-5`) with my own key, saved in the browser. The server stays with no AI and no API key.
- **The original page text always goes in the prompt, unchanged.** It becomes `full_text`, so the quote check still works.
- **My profile is never in the prompt.** Claude reads it with the server's tools.
- **It's not scraping:** it reads only the page I have open, and only when I click.

## Final files (PDF)

There are two kinds of final file. The truth always comes from the checked Markdown saved in our database.

### 1. ATS PDF (main, for job sites)

- **Our server makes it**, from the checked Markdown, using one fixed, simple template: one column, clear headings, no pictures or tables.
- **The text can't change**, because the server prints exactly the saved, checked text.
- No extra app or account needed.
- Use it to upload on job sites and in ATS forms.
- How to make the PDF (which library) is decided when we build step 5.

### 2. Canva version (optional, for people)

- The AI app connects to the **official Canva MCP server** (`mcp.canva.com/mcp`, I log in with my **Canva Pro** account) **at the same time** as our server.
- **My own master designs:** I make **one CV design and one cover letter design in Canva myself, once**. Their links are saved in our server (in `settings`).
- **Placeholders in the master:** each part of the design is its own text box with a placeholder word, for example `{{NAME}}`, `{{SUMMARY}}`, `{{EXPERIENCE}}`, `{{SKILLS}}`, `{{EDUCATION}}`. The AI replaces the placeholders. It never searches for normal words.
- **Flow for each job (confirmed in Canva's official tool list, all work on Pro):**
  1. Our server gives the final checked text and the master design link.
  2. `copy-design`: the AI makes a **copy** of the master.
  3. `start-editing-transaction` → `perform-editing-operations` with `find_and_replace_text` (one placeholder → its text) → `commit-editing-transaction`. Changes are a draft until commit. If something fails, use `cancel-editing-transaction`, and the copy stays unchanged.
  4. The AI checks every operation result says `success`.
  5. `export-design`: export the copy as a PDF.
- **Never edit the master design.** Always work on a copy.
- Copy name: `CV - <company> - <job title> - v<version>`, for example `CV - Acme - Backend Developer - v2`. The same pattern is used for cover letters.
- Use it **only to send directly to a person** (email to a recruiter, or a printed copy). **Not for job-site uploads**, because pretty designs are often hard for ATS robots to read.
- **Rules for the AI:**
  - Copy the saved text **exactly**: no new words, no changes.
  - Only design changes (layout, colors, fonts).
  - If text must change, change it **in our server first** (with proofs), then make the Canva version again.
- I **always read the Canva PDF** before sending it, because our server can't check what's inside a Canva design.
- Save the Canva design link with the document, so I can find it again.
- **Why copy + replace, not autofill?** Canva's `autofill-design` (brand templates) also works on Pro+, but it uses fixed fields. A CV has lists that change size (for example 2 jobs or 5 jobs), and placeholder text boxes handle that more easily. We can switch to autofill later if we want.

**What's confirmed vs. what to test once:**

| Topic | Status |
|---|---|
| `copy-design`, editing tools, `find_and_replace_text`, `export-design` exist and work on Pro | ✅ Confirmed in Canva's official docs |
| My AI app can connect to the Canva MCP server | Test once, when we build |
| **Long text fits the text box** (for example 5 jobs) | Test once. Canva doesn't make the box bigger by itself. Leave room in the master, or keep the CV text short. |
| Text style (bold, size) stays the same after replace | Test once. Give each placeholder box one style only. |
| Rate limits | No problem: `copy-design` and `export-design` allow 20 per minute. |

**Backup if a test fails:** I duplicate the master in Canva myself, and the AI only fills in the text and exports.

## Not planned (we decided NOT to build these)

Do not add these unless I ask:

- Anything **after I apply**: application status tracker, follow-up reminders, thank-you notes, interview prep, STAR story bank, stats.
- **Auto-apply** bots (sending applications for me).
- **Job search or scraping** from job sites (I paste the job text).
- **Word / .docx files** (we use our own PDF plus Canva instead).
- Many users and login.
- Languages other than English (for now).

## Important limit (be honest)

The server can check that each proof link **exists**, for example "skill #4 is real".
It **cannot** fully check that the sentence says the truth about that item. For example, "5 years" might be written when the proof says 3 years.
So **I must read every CV before I send it.** The proof links make this easy, because each fact shows where it came from.

> **Exact tables and columns:** see [DATABASE.md](DATABASE.md). That file is the source of truth for the database. This file explains the ideas.

## Profile schema (what the AI saves from my CV)

Based on the [JSON Resume](https://jsonresume.org/schema) standard, changed for this project:
- Achievements are their own rows, so they can be proofs.
- Every row has a `checked` field.

**Every row also has:** `id`, `source` (`imported` from the CV, or `manual` = added by me) and `checked` (yes/no).

**Dates** can be `YYYY`, `YYYY-MM` or `YYYY-MM-DD`, because CVs often show only the year or the month. An empty end date means "now".

| Table | Fields |
|---|---|
| `profile` (one row) | name, headline, email, phone, city, country, summary, links (GitHub, LinkedIn, website) |
| `experiences` | company, position, type (`full-time` / `part-time` / `intern` / `freelance` / `volunteer`), city, remote (yes/no), start, end, summary |
| `achievements` | belongs to (one experience **or** one project), text, number (optional, e.g. "40%") |
| `skills` | name, other names (e.g. "Node", "NodeJS", used by the ATS check), category (`language` / `framework` / `tool` / `soft skill`), level (`beginner` / `good` / `expert`) |
| `skill_proofs` | skill, proof item (an experience, project, education or certificate) |
| `projects` | name, my role, description, links (GitHub, live site), start, end |
| `education` | school, degree, field, start, end, grade (optional) |
| `certificates` | name, issuer, date, expires (optional), link (optional) |
| `languages` | language, level (`A1`-`C2` or `native`) |

Rules:
- **No "years" field for skills.** Years are counted from the dates of the items that prove the skill, so they can't be wrong.
- **Not included:** awards, publications, references, interests, hobbies, photo, birth date, nationality, driving license. My CV doesn't use them. Add them only if I ask.

**Import flow:** the AI reads my CV and saves every item with `checked = no`. I review the list, fix mistakes and mark items `checked = yes`. Only checked items can be proofs.

## Job schema (what the AI saves from a job post)

| Table | Fields |
|---|---|
| `jobs` | title, company (links to `companies`), city, country, work mode (`on-site` / `hybrid` / `remote`), contract (`full-time` / `part-time` / `internship` / `freelance` / `temporary`), level (`junior` / `mid` / `senior` / `lead`), salary (min, max, currency, `month` / `year`, all optional), link (saved only as a note, **never opened**), posted date, deadline (optional), full text (what I pasted, **never changed**), skipped (yes/no), skip reason |
| `requirements` | job, text (e.g. "3+ years with Node.js"), quote (the exact sentence from the job text), type (`must-have` / `nice-to-have`), category (`skill` / `years of experience` / `education` / `certificate` / `language` / `soft skill`), keywords (used by the ATS check), min years (optional) |
| `matches` | requirement, result (`yes` / `partly` / `no`), note (e.g. "Partly: 2 years, not 3"), date |
| `match_proofs` | match, proof item (only **checked** profile items) |

Rules:
- **Quote check (lie guard for jobs):** every requirement must have a quote. The server checks that the quote really is in the job's full text. If it isn't, the server rejects the requirement, so the AI can't invent one.
- **Requirements don't need my check.** The quote check is enough. I can still fix any requirement at any time.
- **Must-have or nice-to-have:**
  - must-have words: "required", "must", "you have", "you need".
  - nice-to-have words: "nice to have", "bonus", "a plus", "preferred".
  - **If it's not clear, choose must-have.** I can change it.
- **Re-running a match replaces the old result** for that job. The gap report always uses the newest result.
- **Fit label (a fixed rule, counted by the server, no AI):**

  | Rule | Label |
  |---|---|
  | All must-haves are `yes` | **Good fit** |
  | Exactly 1 must-have is `no`, **or** no must-have is `no` but at least 1 is `partly` | **Some gaps** |
  | 2 or more must-haves are `no` | **Big gaps** |

  Nice-to-haves don't change the label. They still show in the list.
- **Skip a job:** I can mark a job as skipped and write why (e.g. "salary too low"). It leaves my main list but **still counts in the gap report**.

## Data (all tables, planned)

| Table | What it holds |
|---|---|
| `profile`, `experiences`, `achievements`, `skills`, `skill_proofs`, `projects`, `education`, `certificates`, `languages` | My profile (see "Profile schema" above). |
| `companies` | Company notes: name, website, what they do, why I like them. |
| `contacts` | People: name, role, email, LinkedIn, company. |
| `jobs`, `requirements`, `matches`, `match_proofs` | Job posts and the match (see "Job schema" above). |
| `documents` | Each CV or cover letter: job, type, version, Markdown text, sent or not, date. |
| `document_claims` | Each fact in a document and its proof (a profile item or a company note). |
| `banned_phrases` | Phrases that sound like AI. I can edit the list. |
| `learning_items` | Learning plan: skill, status, dates, links, notes. |

## Server tools (planned, by topic)

> **Exact tool names, inputs and outputs:** see [TOOLS.md](TOOLS.md). That file is the source of truth for tools and prompts.

- **Profile:** read and update the profile, and add, change or delete experiences, achievements, skills, skill proofs, projects, education, certificates and languages. List the items that are not checked yet, and mark items as checked.
- **Companies:** add, change and read company notes and contacts.
- **Jobs:** add a job (pasted text), read and list jobs, skip a job (with a reason), and save and fix requirements (the server runs the quote check).
- **Match:** save the match result, read it, and show a "gap report" of the skills I miss most across all jobs. The gap report is plain SQL, so it needs no AI.
- **Learning:** add, change and list learning items. When an item is `done`, remind me to add the proof to my profile and re-run the matches.
- **Documents:** save a CV or letter with its claims (the server checks the proofs and warns about banned phrases), list and read them, mark one as sent, and run the ATS keyword check.
- **Banned phrases:** list, add and remove phrases.

## Server prompts (planned)

Ready instructions that the AI app uses. They hold the writing rules: tell the truth, ATS style, 1-2 pages, English, sound human, and avoid banned phrases.

- `import_cv`: read my CV and my portfolio site, and save everything with one `profile_import` call.
- `analyze_job`: pull out the requirements and save them.
- `check_match`: compare the requirements with my profile.
- `tailor_cv`: write a CV for one job, with proofs.
- `write_cover_letter`: write a letter for one job, with proofs for facts.

## Build order

1. **Profile**: tables, tools and the `import_cv` prompt.
2. **Jobs + match**: company notes and contacts, requirements, the match report and the gap report (bonus).
3. **Learning plan**, built on the gap report.
4. **CV + cover letter**: documents with the proof check, version history, the "sounds human" check and the ATS keyword check.
5. **PDF export**: our own ATS PDF first, then the optional Canva version.
6. **The agent (optional, later)**, which runs the whole flow with one command. Steps 1-5 already work fully without it, in Claude Desktop, VS Code or Claude Code. Build it only if I ask.

Each step works on its own and is useful before the next one starts.

**The dashboard grows with the steps:** step 1 adds login, Home, Profile and Review (with their `/api` addresses). Step 2 adds Jobs. Later steps add their own pages.
The extension can be built any time. It needs `job_add` and `requirements_set` (step 2) to be useful.
