# Admin API (for the dashboard)

Every address of the server's admin API. **This file is the source of truth for the admin API.**
If you add or change an address, update this file in the same change.

Status: building. Done: `/api/stats`, `/api/profile` and `/api/review` (in `packages/server/src/api/`). `/api/jobs` comes with build step 2. The server must run with `TRANSPORT=http` for `/api` to exist.

Who uses it: only the dashboard (`Job Hunt/FrontEnd/`), from the Next.js **server side**. The AI apps use `/mcp`, never `/api`.

---

## 1. Rules for all addresses

| Rule | Detail |
|---|---|
| Where | The HTTP transport, next to `/mcp`. Base: `/api`. Listens on `127.0.0.1` only. |
| Login | **None.** Only the dashboard's Next.js server, on my computer, calls it. The `Host` and `Origin` checks block other web pages. |
| Layers | Same as tools: **route -> service -> repository**. A route checks the input, calls a service and returns JSON. No SQL and no logic in routes. |
| Same services | The API calls **the same services** as the MCP tools. So every rule (quote check, proofs, "AI edits make an item unchecked", ...) works the same way. |
| Shapes | Inputs and outputs use the Zod schemas from `@jobhunt/shared` (`packages/shared/`). Every shape and its fields: `SHARED.md`. JSON uses `snake_case`, `true`/`false` (not `0`/`1`), real lists (not JSON text) and `null` for empty. |
| Errors | JSON: `{ "error": "short message", "problems": ["...", "..."] }`. **400** = wrong input or a broken rule (a list of **all** problems at once, like the tools; each line is `field: message`). **404** = not found. **409** = it already exists (a duplicate skill or language). Any other error: **500** `Server error`. |
| Browsers | **No CORS headers.** A browser page can't call the API directly. Only the Next.js server can. |
| Logs | Never log the MCP token. Logs go to stderr. |

---

## 2. Home

| Method + address | What it does | Output |
|---|---|---|
| `GET /api/stats` | The numbers for Home. Read-only. | `StatsSchema`: `jobs_total`, `jobs_by_fit` (`good_fit`, `some_gaps`, `big_gaps`, `not_matched`), `unchecked_items` (the profile row counts too), `top_missing_skills` (5, from the gap report) |

Until jobs exist (build step 2), the job numbers are `0` and `top_missing_skills` is empty.

---

## 3. Profile

`:type` is one of: `experience`, `achievement`, `skill`, `skill_proof`, `project`, `education`, `certificate`, `language`. Same idea as the `profile_item_*` tools: one set of addresses for all kinds.

| Method + address | What it does | Input | Output |
|---|---|---|---|
| `GET /api/profile` | My profile and all items, grouped by kind. | | Profile + items (each with `checked`) |
| `PATCH /api/profile` | Change my profile (name, headline, ...). | The fields to change | The changed profile |
| `POST /api/profile/items` | Add an item. | `type` + the fields of that kind | The new item (`source = manual`, `checked = 0`) |
| `PATCH /api/profile/items/:type/:id` | Change an item. Not for `skill_proof` (delete it and add a new one). | The fields to change (the kind comes from the address) | The changed item. **If it was checked, it becomes not checked.** |
| `DELETE /api/profile/items/:type/:id` | Delete an item (its proofs are deleted too). | | `deleted` (the item), `also_deleted` (`achievements`, `skill_proofs`), `jobs_to_rematch` |

A new item answers **201**. Its `source` is `manual`.

---

## 4. Review (checking items)

| Method + address | What it does | Input | Output |
|---|---|---|---|
| `GET /api/review` | Everything with `checked = 0`, grouped: one group per job and per project (with its achievements and skill proofs), then Education, Certificates, Skills, Languages. | | `ReviewListSchema`: `profile` (only when it waits), `groups` (`key`, `title`, `entries`: each `{ item, summary }`), `total` |
| `POST /api/review/check` | **Set `checked = 1`** (and `checked_at`). All or nothing: one wrong id and nothing is checked. | `CheckInputSchema`: `items`, a list (1-50) of `{ type, id }` or `{ type: "profile" }` | `CheckResultSchema`: `profile` (or `null`), `items` |
| `POST /api/review/fix` | Fix an item **and** check it, in one transaction (a fix by me stays checked). Not for `skill_proof`. | `FixInputSchema`: `{ id, changes }` (`changes` like `ProfileItemUpdateInput`, with its `type`) or `{ type: "profile", changes }` | The fixed, checked item (or profile) |

The profile row is not an item kind, but it waits for a check too (`profile_update` sends me to `/review?type=profile`). So the review addresses also take `{ type: "profile" }`, with no id (there is only one profile). Decided on 2026-10-14.

This is the **only** way to set `checked = 1`. The MCP tools only send me here with their `review_link`. See `DATABASE.md`, part 12.

---

## 5. Jobs

| Method + address | What it does | Input | Output |
|---|---|---|---|
| `GET /api/jobs` | List my jobs. | Query: `fit`, `include_skipped` (default no), `limit` (default 20), `offset` | Jobs: id, title, company, fit label, date + `total` |
| `GET /api/jobs/:id` | One job with requirements, match results, proofs and fit label. | | The job |
| `PATCH /api/jobs/:id` | Change job fields. **Never `full_text`.** | The fields to change | The changed job |
| `POST /api/jobs/:id/skip` | Skip or un-skip. | `skipped` (yes/no), `reason` (**required** when skipping) | The changed job |

Adding jobs is **not** in the API. Jobs come in through the AI app (`job_add`).

---

## 6. Later

Addresses for Companies, Documents, Learning, Gap report and Settings come with their server step (see `PRODUCT.md`, "Build order").
