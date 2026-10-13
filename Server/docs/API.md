# Admin API (for the dashboard)

Every address of the server's admin API. **This file is the source of truth for the admin API.**
If you add or change an address, update this file in the same change.

Status: building. `/mcp` and `/health` exist (the HTTP door). No `/api` address exists yet: they come with the `/api/profile` and `/api/review` step in `AGENTS.md`, "Current status".

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
| Errors | JSON: `{ "error": "short message", "problems": ["...", "..."] }`. **400** = wrong input (a list of **all** problems at once, like the tools). **404** = not found. |
| Browsers | **No CORS headers.** A browser page can't call the API directly. Only the Next.js server can. |
| Logs | Never log the MCP token. Logs go to stderr. |

---

## 2. Home

| Method + address | What it does | Output |
|---|---|---|
| `GET /api/stats` | The numbers for Home. Read-only. | `jobs_total`, `jobs_by_fit` (Good fit / Some gaps / Big gaps / not matched yet), `unchecked_items`, `top_missing_skills` (5, from the gap report) |

---

## 3. Profile

`:type` is one of: `experience`, `achievement`, `skill`, `skill_proof`, `project`, `education`, `certificate`, `language`. Same idea as the `profile_item_*` tools: one set of addresses for all kinds.

| Method + address | What it does | Input | Output |
|---|---|---|---|
| `GET /api/profile` | My profile and all items, grouped by kind. | | Profile + items (each with `checked`) |
| `PATCH /api/profile` | Change my profile (name, headline, ...). | The fields to change | The changed profile |
| `POST /api/profile/items` | Add an item. | `type` + the fields of that kind | The new item (`source = manual`, `checked = 0`) |
| `PATCH /api/profile/items/:type/:id` | Change an item. | The fields to change | The changed item. **If it was checked, it becomes not checked.** |
| `DELETE /api/profile/items/:type/:id` | Delete an item (its proofs are deleted too). | | What was deleted |

---

## 4. Review (checking items)

| Method + address | What it does | Input | Output |
|---|---|---|---|
| `GET /api/review` | Items with `checked = 0`, grouped (for example one experience with its achievements). | | Groups of items |
| `POST /api/review/check` | **Set `checked = 1`** (and `checked_at`). | `items`: a list of `{ type, id }` | The checked items |
| `POST /api/review/fix` | Fix an item **and** check it (a fix by me stays checked). | `type`, `id`, the fields to change | The fixed, checked item |

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
