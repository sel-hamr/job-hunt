# Database

Everything about the database. **This file is the source of truth for tables and columns.**
If you change the database, update this file in the same change.

Status: building. `001_profile.sql` (part 5) exists. The other parts are still plans.

---

## 1. Basics

| Topic | Value |
|---|---|
| Engine | SQLite, through Node's built-in `node:sqlite` (Node 24+) |
| File | `packages/server/data/jobs.sqlite`. Change it with the `DB_PATH` setting. **Never commit it** (personal data). |
| Who opens it | **Only the server**, and only in `packages/server/src/db/connection.ts`. The agent never opens it. |
| Open how many times | **Once** at server start. The same connection is used for every request. |

### Settings set when the database opens

| Setting | Value | Why |
|---|---|---|
| `journal_mode` | `WAL` | The stdio server and the HTTP server can use the same file at the same time. |
| `foreign_keys` | `ON` | Links between tables are protected. SQLite turns this **off** by default, so it must be set every time the database opens. |
| `busy_timeout` | `5000` (ms) | If the other server is writing, wait up to 5 seconds instead of failing at once. |
| `synchronous` | `NORMAL` | Safe with WAL, and faster than `FULL`. |

### `node:sqlite` notes

- The API is **synchronous**: each query stops Node until it is done. Keep queries small and fast.
- Node 24 names the class `DatabaseSync`. Node 26 renames it to `Database` and keeps `DatabaseSync` as a deprecated alias. Only `connection.ts` imports it, so the change is one line.

---

## 2. Migrations (how tables are created and changed)

- Migrations are SQL files in `packages/server/src/db/migrations/`, numbered: `001_profile.sql`, `002_jobs.sql`, and so on.
- At start, the server runs the files it has not run yet, in order.
- The database remembers the last number it ran in `PRAGMA user_version`.
- **Never edit a migration that has already run.** To change something, add a new file.
- Each migration runs inside a transaction, so it fully works or fully fails.

---

## 3. Rules for all tables

| Rule | Detail |
|---|---|
| Table names | Plural, `snake_case`: `experiences`, `match_proofs`. |
| Column names | `snake_case`: `start_date`, `company_id`. |
| `STRICT` tables | Every table is `STRICT`, so SQLite refuses the wrong data type. |
| `id` | Every table has `id INTEGER PRIMARY KEY` (a number given automatically). |
| `created_at`, `updated_at` | Every table has both. Format: `YYYY-MM-DDTHH:MM:SSZ` in UTC, e.g. `2026-10-10T14:30:00Z`. Both default to now. SQLite does **not** change `updated_at` by itself: the repository sets it on every update. |
| Yes / no | SQLite has no true/false type. We use `INTEGER` with `0` = no and `1` = yes. |
| Fixed choices | Columns with fixed choices (like `type`) use a `CHECK` with the list of allowed values. |
| Small lists | Short lists (links, keywords, other names) are saved as **JSON text**, e.g. `["Node","NodeJS"]`. SQLite can read them with `json_each`. |
| Links between tables | Real foreign keys (`..._id` columns). Every foreign key column has an index. |
| CV dates | Text: `YYYY`, `YYYY-MM` or `YYYY-MM-DD`, because CVs often show only the year or the month. An empty `end_date` means **now**. The format is checked in the code (Zod), not in the database. |
| Money | Whole numbers (`INTEGER`) plus a 3-letter currency code (`MAD`, `EUR`, `USD`). |

### "One of many" links (proofs)

Some rows point to **one** item that can be of different kinds. For example, a proof can be an experience, a project, an education or a certificate.

We use **one column per kind** (e.g. `experience_id`, `project_id`, ...). A `CHECK` makes sure **exactly one** of them is filled.
Why: these are real foreign keys, so the database itself protects the links.

---

## 4. How the tables connect

```
PROFILE (about me)
  profile (1 row)
  experiences ──< achievements >── projects
       │                              │
       └──────< skill_proofs >────────┤
                    │                 │
                  skills        education, certificates
  languages

JOBS (job posts)
  companies ──< company_notes
      │   └──< contacts
      └──< jobs ──< requirements ──── matches ──< match_proofs ──> (profile items)

LEARNING
  learning_items

SETTINGS
  settings (key → value, e.g. Canva master design links)

LOGIN (dashboard only)
  users ──< sessions

DOCUMENTS (designed next)
  documents ──< document_claims ──> (profile items or company notes)
  banned_phrases
```

`A ──< B` means: one A has many B.

---

## 5. Profile tables

Every profile table (except `profile`) also has these columns:

| Column | Type | Rule |
|---|---|---|
| `source` | TEXT | `imported` (from my CV) or `manual` (added by me). Required, no default: the code always says which. |
| `checked` | INTEGER | `0` = not checked, `1` = checked. Default `0`. **Only checked items can be proofs.** Only a human can set it to `1` (see part 12). |
| `checked_at` | TEXT | When it was checked. Empty when not checked. |

A `CHECK` keeps `checked` and `checked_at` together: `checked = 1` needs a `checked_at`, and `checked = 0` needs it empty. This is true for `profile` too.

### `profile` (always exactly 1 row)

| Column | Type | Required | Notes |
|---|---|---|---|
| `id` | INTEGER | yes | Always `1` (a `CHECK` makes sure there is only one row). |
| `name` | TEXT | yes | |
| `headline` | TEXT | no | e.g. "Backend Developer" |
| `email` | TEXT | no | |
| `phone` | TEXT | no | |
| `city` | TEXT | no | |
| `country` | TEXT | no | 2-letter code, e.g. `MA` |
| `summary` | TEXT | no | 2-3 lines about me |
| `links` | TEXT (JSON) | no | e.g. `[{"label":"GitHub","url":"..."}]` |
| `checked` | INTEGER | yes | default `0` |
| `checked_at` | TEXT | no | When it was checked. |

### `experiences` (my jobs)

| Column | Type | Required | Notes |
|---|---|---|---|
| `company` | TEXT | yes | |
| `position` | TEXT | yes | |
| `type` | TEXT | yes | `full-time` / `part-time` / `intern` / `freelance` / `volunteer` |
| `city` | TEXT | no | |
| `remote` | INTEGER | yes | `0` / `1`, default `0` |
| `start_date` | TEXT | yes | CV date |
| `end_date` | TEXT | no | empty = now |
| `summary` | TEXT | no | what the job was |

### `achievements` (what I did, in a job or a project)

| Column | Type | Required | Notes |
|---|---|---|---|
| `experience_id` | INTEGER | one of two | → `experiences` |
| `project_id` | INTEGER | one of two | → `projects` |
| `text` | TEXT | yes | e.g. "Made the API 40% faster" |
| `number` | TEXT | no | e.g. `40%`, so it can be checked |
| `position` | INTEGER | yes | order in the list |

- **Exactly one** of `experience_id` / `project_id` is filled.
- If the job or project is deleted, its achievements are deleted too.

### `skills`

| Column | Type | Required | Notes |
|---|---|---|---|
| `name` | TEXT | yes | **unique**, upper/lower case ignored (`Node.js` = `node.js`) |
| `other_names` | TEXT (JSON) | no | e.g. `["Node","NodeJS"]`, used by the ATS check |
| `category` | TEXT | yes | `language` / `framework` / `tool` / `soft skill` |
| `level` | TEXT | yes | `beginner` / `good` / `expert` |

- **No "years" column.** Years are counted from the dates of the items that prove the skill.

### `skill_proofs` (which item proves a skill)

| Column | Type | Required | Notes |
|---|---|---|---|
| `skill_id` | INTEGER | yes | → `skills` |
| `experience_id` | INTEGER | one of four | → `experiences` |
| `project_id` | INTEGER | one of four | → `projects` |
| `education_id` | INTEGER | one of four | → `education` |
| `certificate_id` | INTEGER | one of four | → `certificates` |

- Exactly one of the four item columns is filled.
- If the skill or the item is deleted, the proof is deleted too.
- No duplicates: the same item can't prove the same skill twice. One unique index per kind (for example `(experience_id, skill_id)`) does this, and it also makes lookups fast.
- Like every profile table, it has `source`, `checked` and `checked_at`: the link itself ("this job proves this skill") is a fact I check.

### `projects` (portfolio)

| Column | Type | Required | Notes |
|---|---|---|---|
| `name` | TEXT | yes | |
| `role` | TEXT | no | e.g. "Solo developer" |
| `description` | TEXT | no | |
| `links` | TEXT (JSON) | no | GitHub, live site |
| `start_date` | TEXT | no | CV date |
| `end_date` | TEXT | no | empty = now |

### `education`

| Column | Type | Required | Notes |
|---|---|---|---|
| `school` | TEXT | yes | |
| `degree` | TEXT | yes | e.g. "Master" |
| `field` | TEXT | no | e.g. "Computer Science" |
| `start_date` | TEXT | no | CV date |
| `end_date` | TEXT | no | |
| `grade` | TEXT | no | |

### `certificates`

| Column | Type | Required | Notes |
|---|---|---|---|
| `name` | TEXT | yes | |
| `issuer` | TEXT | yes | |
| `date` | TEXT | yes | CV date |
| `expires` | TEXT | no | CV date |
| `link` | TEXT | no | link to check the certificate |

### `languages` (languages I speak)

| Column | Type | Required | Notes |
|---|---|---|---|
| `language` | TEXT | yes | unique |
| `level` | TEXT | yes | `A1` / `A2` / `B1` / `B2` / `C1` / `C2` / `native` |

---

## 6. Company and job tables

### `companies`

| Column | Type | Required | Notes |
|---|---|---|---|
| `name` | TEXT | yes | unique, upper/lower case ignored |
| `website` | TEXT | no | |
| `about` | TEXT | no | what they do |

### `company_notes` (facts I wrote about a company)

| Column | Type | Required | Notes |
|---|---|---|---|
| `company_id` | INTEGER | yes | → `companies` |
| `text` | TEXT | yes | e.g. "They build payment apps for small shops" |
| `link` | TEXT | no | where I read it |
| `source` | TEXT | yes | `imported` / `manual` (like profile items) |
| `checked` | INTEGER | yes | `0` / `1`, default `0`. Same rules as profile items: only a human can check. |
| `checked_at` | TEXT | no | |

- Each note is **one fact**, so the cover letter can point to it as proof.
- The AI may add notes too, so a note must be **checked** before it can be a proof.

### `contacts` (people at a company)

| Column | Type | Required | Notes |
|---|---|---|---|
| `company_id` | INTEGER | yes | → `companies` |
| `name` | TEXT | yes | |
| `role` | TEXT | no | e.g. "Recruiter" |
| `email` | TEXT | no | |
| `linkedin` | TEXT | no | |
| `notes` | TEXT | no | |

### `jobs` (job posts I pasted)

| Column | Type | Required | Notes |
|---|---|---|---|
| `company_id` | INTEGER | yes | → `companies` (the AI creates the company if it is new) |
| `title` | TEXT | yes | |
| `city` | TEXT | no | |
| `country` | TEXT | no | 2-letter code |
| `work_mode` | TEXT | no | `on-site` / `hybrid` / `remote` |
| `contract` | TEXT | no | `full-time` / `part-time` / `internship` / `freelance` / `temporary` |
| `level` | TEXT | no | `junior` / `mid` / `senior` / `lead` |
| `salary_min` | INTEGER | no | |
| `salary_max` | INTEGER | no | |
| `salary_currency` | TEXT | no | 3 letters, e.g. `MAD` |
| `salary_period` | TEXT | no | `month` / `year` |
| `link` | TEXT | no | saved only as a note, **never opened** |
| `posted_date` | TEXT | no | `YYYY-MM-DD` |
| `deadline` | TEXT | no | `YYYY-MM-DD` |
| `full_text` | TEXT | yes | the text I pasted, **never changed** |
| `skipped` | INTEGER | yes | `0` / `1`, default `0` |
| `skip_reason` | TEXT | no | **required when `skipped` = 1** |

### `requirements` (one row for each thing a job asks for)

| Column | Type | Required | Notes |
|---|---|---|---|
| `job_id` | INTEGER | yes | → `jobs`, deleted with the job |
| `text` | TEXT | yes | e.g. "3+ years with Node.js" |
| `quote` | TEXT | yes | exact sentence from `jobs.full_text` |
| `type` | TEXT | yes | `must-have` / `nice-to-have`. Not clear → `must-have`. |
| `category` | TEXT | yes | `skill` / `years of experience` / `education` / `certificate` / `language` / `soft skill` |
| `keywords` | TEXT (JSON) | yes | e.g. `["Node.js"]`. Used by the ATS check and the gap report. |
| `min_years` | INTEGER | no | e.g. `3` |
| `position` | INTEGER | yes | order in the job post |

- **Quote check:** before saving, the server checks that `quote` is really inside `jobs.full_text`. Small changes in spaces and capital letters are ignored. If the quote isn't there, the row is rejected.

### `matches` (the result for each requirement)

| Column | Type | Required | Notes |
|---|---|---|---|
| `requirement_id` | INTEGER | yes | → `requirements`, **unique** (one result per requirement) |
| `result` | TEXT | yes | `yes` / `partly` / `no` |
| `note` | TEXT | no | e.g. "Partly: 2 years, not 3" |

- Re-running the match **replaces** the old result.

### `match_proofs` (what proves a match)

| Column | Type | Required | Notes |
|---|---|---|---|
| `match_id` | INTEGER | yes | → `matches`, deleted with the match |
| `skill_id` | INTEGER | one of seven | → `skills` |
| `experience_id` | INTEGER | one of seven | → `experiences` |
| `achievement_id` | INTEGER | one of seven | → `achievements` |
| `project_id` | INTEGER | one of seven | → `projects` |
| `education_id` | INTEGER | one of seven | → `education` |
| `certificate_id` | INTEGER | one of seven | → `certificates` |
| `language_id` | INTEGER | one of seven | → `languages` |

- Exactly one item column is filled.
- **The item must be checked** (`checked = 1`). The server's service checks this before saving.
- A `yes` or `partly` result needs **at least one** proof. A `no` result has none.

---

## 7. Learning table

### `learning_items`

| Column | Type | Required | Notes |
|---|---|---|---|
| `skill_name` | TEXT | yes | e.g. "Kubernetes" (often taken from the gap report) |
| `status` | TEXT | yes | `planned` / `learning` / `done` |
| `start_date` | TEXT | no | `YYYY-MM-DD` |
| `target_date` | TEXT | no | `YYYY-MM-DD` |
| `links` | TEXT (JSON) | no | courses, docs |
| `notes` | TEXT | no | |

- **Learning is not having.** Learning items are **never** used in matches or CVs.
- When `status` becomes `done`, the server reminds me to add the skill to my profile **with a proof**.

---

## 7b. Settings table

### `settings` (simple key → value pairs)

| Column | Type | Required | Notes |
|---|---|---|---|
| `key` | TEXT | yes | unique |
| `value` | TEXT | yes | |

Known keys:

| Key | Example value |
|---|---|
| `canva_master_cv` | link to my master CV design in Canva |
| `canva_master_cover_letter` | link to my master cover letter design in Canva |

---

## 7c. Login tables (dashboard only)

Used only by the admin API (`/api`). The MCP tools never read them. See `docs/API.md`.

### `users` (only me: one row)

| Column | Type | Required | Notes |
|---|---|---|---|
| `email` | TEXT | yes | unique, saved in lower case |
| `password_hash` | TEXT | yes | **scrypt** (built into `node:crypto`), with its salt and settings. **Never the plain password.** |

Made only by the "create my user" script in `packages/server/scripts/`. No sign-up.

### `sessions` (who is logged in)

| Column | Type | Required | Notes |
|---|---|---|---|
| `user_id` | INTEGER | yes | → `users`, `ON DELETE CASCADE` |
| `token_hash` | TEXT | yes | unique. **SHA-256 of the session token**, never the token itself. If someone copies the database, they can't log in. |
| `expires_at` | TEXT | yes | 7 days after login |
| `last_used_at` | TEXT | yes | updated on each request |

Rules:
- The token is 32 random bytes (`crypto.randomBytes`). Only the dashboard's cookie holds it.
- A session past `expires_at` is not valid. Old sessions are deleted at server start.
- Logout deletes the session. Changing the password deletes **all** sessions.
- Wrong-password counting (5 tries -> wait 1 minute) lives **in memory**, not in a table. Only the HTTP server takes logins.

---

## 8. Document tables

### `documents` (each CV or cover letter)

| Column | Type | Required | Notes |
|---|---|---|---|
| `job_id` | INTEGER | yes | → `jobs` |
| `type` | TEXT | yes | `cv` / `cover_letter` |
| `version` | INTEGER | yes | 1, 2, 3, … counted for each job **and** type. Unique together with `job_id` + `type`. |
| `markdown` | TEXT | yes | the full text. **Never changed after saving.** |
| `sent` | INTEGER | yes | `0` / `1`, default `0` |
| `sent_at` | TEXT | no | when I sent it |
| `ats_pdf_path` | TEXT | no | e.g. `data/exports/CV - Acme - Backend Developer - v2.pdf` |
| `canva_design_url` | TEXT | no | link to the Canva copy |

- **A saved document never changes.** To change a CV, save a **new version**. So the CV I sent is always kept exactly as it was.
- After saving, only `sent`, `sent_at`, `ats_pdf_path` and `canva_design_url` can still be set.
- PDF files live in `packages/server/data/exports/`. **Never commit them.**

### `document_claims` (each fact and its proof)

| Column | Type | Required | Notes |
|---|---|---|---|
| `document_id` | INTEGER | yes | → `documents`, deleted with the document |
| `claim` | TEXT | yes | the fact, e.g. "Made the API 40% faster". **Must be inside `documents.markdown`.** |
| `skill_id` | INTEGER | one of eight | → `skills` |
| `experience_id` | INTEGER | one of eight | → `experiences` |
| `achievement_id` | INTEGER | one of eight | → `achievements` |
| `project_id` | INTEGER | one of eight | → `projects` |
| `education_id` | INTEGER | one of eight | → `education` |
| `certificate_id` | INTEGER | one of eight | → `certificates` |
| `language_id` | INTEGER | one of eight | → `languages` |
| `company_note_id` | INTEGER | one of eight | → `company_notes` (cover letters only) |

- Exactly one proof column is filled.
- The proof item must be **checked**.

### `banned_phrases`

| Column | Type | Required | Notes |
|---|---|---|---|
| `phrase` | TEXT | yes | unique, upper/lower case ignored |

Starter list (I can add or remove any):
"I am thrilled to", "I am excited to apply", "To whom it may concern", "fast-paced environment", "in today's fast-paced world", "proven track record", "results-driven", "detail-oriented", "team player", "go-getter", "passionate about", "think outside the box", "hit the ground running", "wear many hats", "synergy", "leverage", "cutting-edge", "seamlessly", "delve", "I believe I would be a great fit".

### Checks when a document is saved (in this order)

The server **rejects** the document if any check 1-4 fails, and gives a clear list of the problems.

| # | Check | Fails when |
|---|---|---|
| 1 | **Claim check** | A claim is not inside the text. |
| 2 | **Proof check** | A proof item doesn't exist or isn't checked. |
| 3 | **Number check** | A number in the text (`40%`, `3 years`, `2022`, `3+`) is not inside any claim. **Not counted:** my own phone number, email and links from `profile`. |
| 4 | **Skill check** | The text names a skill that is not a **checked** skill in my profile (by `name` or `other_names`). The server knows skill names from all my skills **and** all job requirement keywords. |
| 5 | **Banned phrases** | Not a rejection, only a **warning**. I decide. |

If all checks pass, the server saves the document as the next version and returns its id, version and any warnings.

**Limits (be honest):**
- The number check finds digits only. "five years" written as a word is **not** caught.
- The skill check only knows words it has already seen, in my profile or in job keywords.
- So I **still read every document** before I send it.

---

## 9. Things counted, not saved

These are **counted when asked** (SQL views or queries), never saved. So they are always correct and up to date.

| What | How |
|---|---|
| **Fit label** of a job | From `matches` of its must-haves: all `yes` → **Good fit**. Exactly 1 `no`, or no `no` but at least 1 `partly` → **Some gaps**. 2 or more `no` → **Big gaps**. No match saved yet → **Not matched**. |
| **Gap report** | Count the keywords of requirements whose match is `no` (or `partly`), across all jobs, **including skipped ones**. Filters: last N jobs, date range, must-have only. |
| **Years of a skill** | From the dates of the checked experiences and projects that prove it. Overlapping time is counted once. |

---

## 10. Rules the server checks (not the database)

Some rules need to look at other tables, so the **services** check them before saving:

1. A proof must point to a **checked** item.
2. A requirement's `quote` must be inside its job's `full_text`.
3. A `yes` / `partly` match needs at least one proof.
4. A learning item never counts as a skill.
5. A saved document never changes. Changes create a new version.
6. Document checks: claim, proof, number and skill checks reject. Banned phrases only warn (see part 8).
7. Only a human can set `checked = 1` (see part 12).
   A normal edit sets `checked = 0` again, in the same transaction as the edit.
8. Every `/api` request needs a valid, not expired session (see part 7c), except login.
9. When only checked facts are used (matching, CVs): an achievement counts only if its job or project is checked too, and a skill proof only if its skill and its item are checked too.

---

## 11. Backups

- `node:sqlite` has a built-in `backup()` function.
- Plan: a script in `packages/server/scripts/` that copies the database to a backup file with a date in its name.

---

## 12. Checked items: how only a human can check

### The problem

The AI calls every MCP tool. If a normal tool could set `checked = 1`, the AI could check items by mistake, and the lie guard would mean nothing.

### The decision: only places the AI can't reach can check

**Main way: the dashboard's Review page.**

The dashboard (`Job Hunt/FrontEnd/`) calls `POST /api/review/check` or `POST /api/review/fix` with my **login session**. The AI apps use `/mcp` and never have a session, so they can't call these addresses. See `docs/API.md`, part 5.

**Second way: MCP elicitation (form mode)**, when I'm working inside Claude:

1. The AI calls the tool `review_items` (for example, "review my imported jobs").
2. The **server** sends me a text question through the AI app. Example:

   ```
   Is this correct?
   Backend Developer @ Acme, 2022-03 -> now, full-time, Rabat
   - Made the API 40% faster

   Answer: [Yes] [No] [Fix: ______]
   ```

3. **My answer goes straight to the server.** The AI does not answer it.
   - **Yes** → the server sets `checked = 1`.
   - **Fix** → the server saves my text change, and the item stays checked, because a human made it.
   - **No** or **cancel** → nothing changes.
4. The server asks about a few items at a time (for example, one job with its achievements), so it isn't slow.

**Third way (backup): a review script in the terminal** (`packages/server/scripts/`).
Same questions, same answers, but in a terminal window, with no AI at all.
Use it when the AI app doesn't support elicitation.

### Rules

1. **Only the dashboard's review addresses, answers to elicitation questions, or the review script can set `checked = 1`.** No normal tool can.
2. **When an item is edited** with a normal tool or a normal profile address (`PATCH /api/profile/items/...`), it becomes `checked = 0` again.
3. **When I fix an item** through `POST /api/review/fix`, an elicitation answer or the review script, it stays checked.
4. **A checked item that is used as a proof can be deleted.** Its proofs are deleted with it (foreign keys with `ON DELETE CASCADE`). Then I re-run the match.
5. Every profile item also saves `checked_at` (when it was checked).

### Things to confirm when we build

- **App support:** I couldn't confirm that Claude Desktop supports elicitation yet. On first connect, the server sees whether the app declared the `elicitation` capability. If it didn't, `review_items` answers: "This app can't ask you directly. Please run the review script."
- **HTTP mode:** SDK v2 HTTP is stateless (one request at a time). Check the SDK v2 docs to confirm that elicitation works inside a tool call in this mode.
- **Never** use elicitation to ask for passwords or tokens. The MCP spec forbids it in form mode.
