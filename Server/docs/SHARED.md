# Shared package (`@jobhunt/shared`)

Everything about the shared data shapes. **This file is the source of truth for `@jobhunt/shared`.**
If you add or change a shape, update this file in the same change.

Status: planning. No code yet.

---

## 1. What it is, and why

`@jobhunt/shared` lives in `Server/packages/shared/`. It holds the **shapes of the data** (Zod schemas + TypeScript types) that more than one program needs.

```
                 @jobhunt/shared  (shapes only)
                 /                \
   Server (/api routes)        Dashboard (FrontEnd/)
   checks input + output       forms, tables, API answers
```

**Why:** the dashboard reads JSON from the server's admin API. If the server renames a field (for example `end_date` → `end`) and the dashboard isn't changed, the dashboard breaks silently.
With one shared package, **TypeScript shows the error in both programs at once**.

---

## 2. Who uses it

| Program | What it uses it for |
|---|---|
| **Server**: `src/api/` | Check the input of every `/api` address, and the shape of every answer. |
| **Server**: `src/schemas/` | The MCP tool schemas **import** the shared building blocks (dates, choices, item shapes) instead of writing them again. |
| **Dashboard**: `src/lib/api/` | Check every answer from the server (`Schema.parse(json)`). |
| **Dashboard**: `src/features/*/` | Form checks (react-hook-form + `zodResolver(Schema)`), types for tables, and the options of select boxes (from the choice lists). |
| **Extension** | **Not now.** It never talks to the server. Later, `core/job-fields.ts` could import `JobAddFieldsSchema` from here, so the AI fields always match `job_add`. |

---

## 3. Rules

1. **Only shapes.** No logic, no database, no `fetch`, no Node-only code (`node:fs`, `node:crypto`, ...). It must also run in the browser.
2. **One dependency: `zod` v4**, as a **peer dependency**, so the server and the dashboard use their own single copy. Two copies of Zod can break `instanceof` checks and type matching.
3. **Shape checks here, rule checks in the services.** A shape check needs only the data itself ("`email` is an email", "`type` is one of 5 words"). A rule check needs the database ("the quote is inside the job text", "the proof is checked"), so it lives in the server's services, **never here**.
4. **The JSON names match the database**: `snake_case` (`start_date`, `skip_reason`), the same as `DATABASE.md` and `API.md`.
5. **Real JSON types in the API, not SQLite types:**
   - yes/no is `true` / `false` (the database's `0` / `1` is changed in the repository),
   - JSON-text columns (`links`, `keywords`, `other_names`) are real arrays,
   - empty values are `null`, never `""`.
6. **The choice lists are exported as constants** (for example `EXPERIENCE_TYPES`), and both the schema and the dashboard's select boxes use them. The words must match the `CHECK` lists in `DATABASE.md`.
7. **No secrets, no example data** in this package.

---

## 4. Package setup

```
Server/packages/shared/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts        exports everything
    ├── common.ts       building blocks
    ├── errors.ts
    ├── auth.ts
    ├── stats.ts
    ├── profile.ts
    ├── review.ts
    └── jobs.ts
```

`package.json` (main parts):

```json
{
  "name": "@jobhunt/shared",
  "private": true,
  "type": "module",
  "exports": { ".": "./src/index.ts" },
  "peerDependencies": { "zod": "^4" }
}
```

- **No build step.** The package ships its TypeScript source (`src/index.ts`).
- **Dashboard:** `"@jobhunt/shared": "file:../Server/packages/shared"` in `FrontEnd/package.json`, and `transpilePackages: ["@jobhunt/shared"]` in `next.config.ts`, so Next.js compiles it.
- **Server:** it's a package in the `Server/` npm workspace, so the server imports `@jobhunt/shared` like any package.
- **To confirm when we build the server:** how the server runs TypeScript from another package (a `tsc` build with project references, or Node 24's type stripping). Decide it in step 1, then write the answer here.

---

## 5. Naming

| What | Name | Example |
|---|---|---|
| A schema | `PascalCase` + `Schema` | `ExperienceSchema` |
| Its type | the same name, no `Schema` | `type Experience = z.infer<typeof ExperienceSchema>` |
| Input to create | `...CreateInput` | `ExperienceCreateInputSchema` (no `id`, no `checked`, no timestamps) |
| Input to change | `...UpdateInput` | `ExperienceUpdateInputSchema` (every field optional, at least one needed) |
| A choice list | `UPPER_SNAKE_CASE` | `EXPERIENCE_TYPES = ["full-time", ...] as const` |
| A file | the topic, lower case | `profile.ts`, `jobs.ts` |

**The input schemas never contain** `id`, `checked`, `checked_at`, `source`, `created_at` or `updated_at`. The server sets these. That way the dashboard **can't** send `checked: true` through a normal profile address. Checking only happens through `/api/review/*` (see `DATABASE.md`, part 12).

---

## 6. Building blocks (`common.ts`)

| Name | Shape | Example |
|---|---|---|
| `IdSchema` | whole number > 0 | `12` |
| `CvDateSchema` | `YYYY`, `YYYY-MM` or `YYYY-MM-DD` | `2022`, `2022-03` |
| `DayDateSchema` | `YYYY-MM-DD` only | `2026-10-10` |
| `TimestampSchema` | UTC `YYYY-MM-DDTHH:MM:SSZ` | `2026-10-10T14:30:00Z` |
| `SourceSchema` | `imported` / `manual` | |
| `CheckFieldsSchema` | `checked` (bool), `checked_at` (timestamp or `null`), `source` | added to every profile item |
| `LinkSchema` | `{ label, url }`, `url` is a real `http(s)` link | `{ "label": "GitHub", "url": "https://..." }` |
| `CountryCodeSchema` | 2 capital letters | `MA` |
| `CurrencyCodeSchema` | 3 capital letters | `MAD` |
| `PageQuerySchema` | `limit` (1-100, default 20), `offset` (default 0) | |

---

## 7. Shapes, file by file

### `errors.ts`

| Schema | Fields |
|---|---|
| `ApiErrorSchema` | `error` (short text), `problems` (list of texts, maybe empty) |

### `auth.ts`

| Schema | Fields |
|---|---|
| `LoginInputSchema` | `email` (email, made lower case), `password` (text, 1-200 characters) |
| `LoginResultSchema` | `session` (text), `expires_at` (timestamp) |
| `MeSchema` | `email` |

### `stats.ts`

| Schema | Fields |
|---|---|
| `StatsSchema` | `jobs_total`, `jobs_by_fit` (`good_fit`, `some_gaps`, `big_gaps`, `not_matched`), `unchecked_items`, `top_missing_skills` (list of `{ keyword, jobs, must_have }`, max 5) |

### `profile.ts`

Choice lists: `EXPERIENCE_TYPES`, `SKILL_CATEGORIES`, `SKILL_LEVELS`, `LANGUAGE_LEVELS`, `PROFILE_ITEM_TYPES` (`experience`, `achievement`, `skill`, `skill_proof`, `project`, `education`, `certificate`, `language`).

| Schema | Fields (every item also has `id`, the check fields and timestamps) |
|---|---|
| `ProfileSchema` | `name`, `headline`, `email`, `phone`, `city`, `country`, `summary`, `links` (list of `Link`), `checked` |
| `ExperienceSchema` | `company`, `position`, `type`, `city`, `remote` (bool), `start_date`, `end_date` (`null` = now), `summary` |
| `AchievementSchema` | `experience_id` **or** `project_id` (exactly one), `text`, `number`, `position` |
| `SkillSchema` | `name`, `other_names` (list), `category`, `level` |
| `SkillProofSchema` | `skill_id` + exactly one of `experience_id` / `project_id` / `education_id` / `certificate_id` |
| `ProjectSchema` | `name`, `role`, `description`, `links`, `start_date`, `end_date` |
| `EducationSchema` | `school`, `degree`, `field`, `start_date`, `end_date`, `grade` |
| `CertificateSchema` | `name`, `issuer`, `date`, `expires`, `link` |
| `LanguageSchema` | `language`, `level` |
| `ProfileItemSchema` | a **discriminated union** on `type`: `{ type: "experience", ...Experience }`, `{ type: "skill", ...Skill }`, ... |
| `ProfileItemCreateInputSchema` | the same union, with the create fields only |
| `ProfileItemUpdateInputSchema` | the same union, every field optional |
| `ProfileWithItemsSchema` | `profile` + one list per kind (answer of `GET /api/profile`) |

Shape checks that live **here** (they need only the item itself):
- "exactly one of" links (achievement, skill proof),
- `end_date` is not before `start_date`, when both are full enough to compare.

### `review.ts`

| Schema | Fields |
|---|---|
| `ReviewGroupSchema` | `title` (for example "Backend Developer @ Acme"), `items` (list of `ProfileItem`) |
| `ReviewListSchema` | `groups` (list of `ReviewGroup`), `total` |
| `CheckInputSchema` | `items`: list of `{ type, id }`, 1-50 items |
| `FixInputSchema` | `type`, `id`, the fields to change (like `ProfileItemUpdateInput`) |

### `jobs.ts`

Choice lists: `WORK_MODES`, `CONTRACTS`, `JOB_LEVELS`, `SALARY_PERIODS`, `REQUIREMENT_TYPES`, `REQUIREMENT_CATEGORIES`, `MATCH_RESULTS`, `FIT_LABELS` (`good_fit`, `some_gaps`, `big_gaps`, `not_matched`).

| Schema | Fields |
|---|---|
| `JobAddFieldsSchema` | the optional `job_add` fields: `title`, `company_name`, `city`, `country`, `work_mode`, `contract`, `level`, `salary_min`, `salary_max`, `salary_currency`, `salary_period`, `posted_date`, `deadline`. (Also what the extension's AI fills in, later.) |
| `JobListItemSchema` | `id`, `title`, `company_name`, `fit` (a fit label), `skipped`, `created_at` |
| `JobListSchema` | `jobs` (list), `total` |
| `JobListQuerySchema` | `fit` (optional), `include_skipped` (default `false`), plus `limit` and `offset` |
| `RequirementSchema` | `id`, `text`, `quote`, `type`, `category`, `keywords` (list), `min_years`, `position` |
| `MatchProofSchema` | `type` (a profile item type) + `id` + a short `label` to show |
| `MatchSchema` | `result`, `note`, `proofs` (list of `MatchProof`) |
| `JobSchema` | all job fields + `company_name` + `full_text` + `skipped` + `skip_reason` + `fit` + `requirements` (each with its `match` or `null`) |
| `JobUpdateInputSchema` | the job fields, all optional. **No `full_text`**: it never changes. |
| `JobSkipInputSchema` | `skipped` (bool), `skip_reason` (**required** when `skipped` is `true`) |

---

## 8. Checklist: adding or changing a shape

1. Change the schema in `packages/shared/src/<topic>.ts` (and export it from `index.ts`).
2. If a column changes, change `DATABASE.md` and add a **new** migration (never edit an old one).
3. Change the repository that turns database rows into this shape (`0/1` → bool, JSON text → list).
4. Change the API route and `API.md`, if an address uses it.
5. Run the type-check in **both** the server and the dashboard (`npx tsc --noEmit`), and fix every error.
6. Update this file.
