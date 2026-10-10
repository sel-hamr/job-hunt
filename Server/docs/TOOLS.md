# Tools and prompts

Every MCP tool and prompt the server offers. **This file is the source of truth for tools.**
If you add or change a tool, update this file in the same change.

Status: planning. No tools exist yet.

---

## 1. Rules for all tools

| Rule | Detail |
|---|---|
| Names | `topic_action`, in `snake_case`, e.g. `job_add`, `match_save`. Tools of one topic sort together. |
| Input | Every input is checked with a Zod schema (`src/schemas/`). A wrong input gets a clear error. |
| Output | Structured output (with an `outputSchema`) **plus** a short text summary for the AI. |
| Errors | A rejected save returns a **list of all problems** at once, so the AI can fix them all in one try. Example: `Number "5 years" has no claim. Skill "Kubernetes" is not in your checked profile.` |
| Hints | Read-only tools are marked `readOnlyHint`. Delete tools are marked `destructiveHint`, so the AI app can ask me first. |
| `checked` | **No tool sets `checked = 1`**, except `review_items` with my own answer. A tool that edits a checked item sets it back to `checked = 0`. |
| Descriptions | Each tool has a clear description: what it does, when to use it, and when **not** to use it. The AI reads it to pick the right tool. |
| Step | Each tool is built in the build step shown (see `PRODUCT.md`). |

### Why one set of tools for all profile items

The profile has 9 kinds of items. Separate add, update and delete tools for each kind would mean 27 tools, and too many tools confuse the AI.
So we have **one** `profile_item_add` / `profile_item_update` / `profile_item_delete` with a `type` field.
The input schema changes with the `type`, so each kind is still checked correctly.

---

## 2. Profile tools (step 1)

| Tool | What it does | Input | Output |
|---|---|---|---|
| `profile_get` | Read my whole profile. Read-only. | `only_checked` (yes/no, default no) | Profile + all items, each with `checked`. Skills include **years** (counted from proofs). |
| `profile_update` | Change the main profile row (name, headline, contact, summary, links). | The fields to change | The new profile. `checked` becomes `0` if it was `1`. |
| `profile_item_add` | Add one item. | `type` (`experience` / `achievement` / `skill` / `skill_proof` / `project` / `education` / `certificate` / `language`), `source` (`imported` / `manual`), the item fields | New item with `id`, `checked = 0` |
| `profile_item_update` | Change one item. | `type`, `id`, the fields to change | Changed item. `checked` becomes `0`. |
| `profile_item_delete` | Delete one item. Destructive. | `type`, `id` | What was deleted, **including proofs removed with it**, and which jobs to re-match. |
| `review_items` | **The human check.** The server asks me text questions (MCP elicitation): Yes / No / Fix. | `type` (optional, or all kinds), `limit` (default 5 items per round) | How many I checked, fixed or skipped, and how many are still not checked. |

`review_items` notes:
- It works for profile items **and** company notes.
- If the AI app doesn't support elicitation, it answers: "This app can't ask you directly. Please run the review script."
- **The review script** (`scripts/`) asks the same questions in a terminal. It's a script, not an MCP tool.

---

## 3. Company tools (step 2)

| Tool | What it does | Input | Output |
|---|---|---|---|
| `company_upsert` | Find a company by name, or create it. | `name`, `website` (optional), `about` (optional) | The company with `id`, and whether it is new |
| `company_get` | Read a company with its notes and contacts. Read-only. | `id` or `name` | Company + notes (with `checked`) + contacts |
| `company_item_add` | Add a note or a contact. | `type` (`note` / `contact`), `company_id`, the fields | New item. Notes start with `checked = 0`. |
| `company_item_update` | Change a note or a contact. | `type`, `id`, the fields to change | Changed item. A note becomes `checked = 0`. |
| `company_item_delete` | Delete a note or a contact. Destructive. | `type`, `id` | What was deleted |

---

## 4. Job tools (step 2)

| Tool | What it does | Input | Output |
|---|---|---|---|
| `job_add` | Save a pasted job post. | `company_name` **or** `company_id`, `title`, `full_text`, and the optional fields (city, work mode, contract, level, salary, link, dates) | New job with `id`. The company is created if it's new. |
| `job_get` | Read one job with its requirements, match and fit label. Read-only. | `id` | Job + requirements + match results + **fit label** |
| `job_list` | List my jobs. Read-only. | `include_skipped` (default no), `fit` (optional filter), `limit` (default 20) | Short list: id, title, company, fit label, date |
| `job_update` | Change job fields. | `id`, the fields to change. **Not `full_text`**, which never changes. | The changed job |
| `job_skip` | Skip or un-skip a job. | `id`, `skipped` (yes/no), `reason` (**required** when skipping) | The changed job |
| `requirements_set` | Save **all** requirements of a job (replaces the old ones and their matches). | `job_id`, a list of requirements (text, quote, type, category, keywords, min years) | Saved requirements, or the **list of problems** (for example, a quote not found in the job text) |
| `requirement_update` | Fix one requirement. | `id`, the fields to change | The changed requirement (quote check runs again) |
| `requirement_delete` | Delete one requirement. Destructive. | `id` | What was deleted |

### Rules in the `requirements_set` description

A job can come in without the `analyze_job` prompt, for example as a prompt copied from the browser extension (see `Extension/README.md`). So **the requirement rules live in the `requirements_set` tool description** (and in the server's `instructions`), where the AI always reads them. `analyze_job` repeats them.

- Every requirement has a **quote**: the exact sentence from the job's `full_text`. Copy it, don't rewrite it.
- **Must-have words:** "required", "must", "you have", "you need".
- **Nice-to-have words:** "nice to have", "bonus", "a plus", "preferred".
- **If it's not clear, choose must-have.**
- Save the job with `job_add` first, then call `requirements_set` with its `job_id`.

---

## 5. Match tools (step 2)

| Tool | What it does | Input | Output |
|---|---|---|---|
| `match_save` | Save the match for a job (replaces the old one). | `job_id`, a list of results (requirement id, `yes` / `partly` / `no`, note, proofs) | Saved results + **fit label**, or the list of problems (for example, a proof that isn't checked, or `yes` with no proof) |
| `gap_report` | The skills I miss most, across all jobs (skipped ones too). Read-only. | `last_n_jobs` (optional), `since` (date, optional), `must_have_only` (default no) | List: keyword, how many jobs, how many as must-have |

---

## 6. Learning tools (step 3)

| Tool | What it does | Input | Output |
|---|---|---|---|
| `learning_add` | Add a skill to learn. | `skill_name`, `target_date`, `links`, `notes` (all optional except the name) | New item, status `planned` |
| `learning_update` | Change an item, for example its status. | `id`, the fields to change | The changed item. When status becomes `done`: a **reminder** to add the skill to my profile with a proof, and re-run the match. |
| `learning_list` | List my learning plan. Read-only. | `status` (optional filter) | List of items |

---

## 7. Document tools (step 4, PDF in step 5)

| Tool | What it does | Input | Output |
|---|---|---|---|
| `document_save` | Save a CV or cover letter as a **new version**. Runs all checks. | `job_id`, `type` (`cv` / `cover_letter`), `markdown`, a list of claims (claim text + proof item) | New `id` + `version` + **warnings** (banned phrases), or the **list of problems** (claim, proof, number and skill checks) |
| `document_get` | Read one document. Read-only. | `id`, **or** `job_id` + `type` (+ `version`, default the newest) | The document + its claims |
| `document_list` | List documents. Read-only. | `job_id` (optional) | List: id, job, type, version, sent, date |
| `document_mark_sent` | Mark a document as sent. | `id` | The changed document |
| `ats_check` | Compare a document with its job's keywords. Read-only. | `document_id` | 3 groups: **in the CV** / **missing, but I have it** (with proof) / **missing, real gap** (don't add) |
| `document_export_pdf` | Make the ATS PDF (step 5). | `id` | The file path in `data/exports/` |
| `document_set_canva` | Save the link of the Canva copy (step 5). | `id`, `url` | The changed document |

---

## 8. Banned phrase tools (step 4)

| Tool | What it does | Input | Output |
|---|---|---|---|
| `banned_phrases_list` | List all banned phrases. Read-only. | none | The list |
| `banned_phrases_edit` | Add and/or remove phrases. | `add` (list), `remove` (list) | The new list |

---

## 9. Settings tools (step 5)

| Tool | What it does | Input | Output |
|---|---|---|---|
| `settings_get` | Read the settings. Read-only. | none | All key → value pairs |
| `settings_set` | Change one setting. | `key` (`canva_master_cv` / `canva_master_cover_letter`), `value` | The changed setting |

---

## 10. Prompts (ready instructions for the AI app)

Each prompt holds the writing rules and tells the AI which tools to use, in which order.

| Prompt | Input | What the AI does | Step |
|---|---|---|---|
| `import_cv` | `cv_text` | Reads my old CV → saves everything with `profile_update` / `profile_item_add` (`source = imported`) → tells me to run `review_items`. | 1 |
| `analyze_job` | `job_id` | Pulls out every requirement with its **exact quote** → `requirements_set`. If it's not clear, it chooses must-have. | 2 |
| `check_match` | `job_id` | `profile_get` (checked only) → compares each requirement → `match_save` → shows me the list and the fit label. | 2 |
| `tailor_cv` | `job_id` | Writes a CV (1-2 pages, ATS-friendly, English, sounds human, no gaps added) **with claims** → `document_save` → fixes the problems if rejected → `ats_check`. | 4 |
| `write_cover_letter` | `job_id` | Writes a letter using checked facts and checked company notes, **with claims** → `document_save`. | 4 |
| `make_canva_version` | `document_id` | `settings_get` → Canva `copy-design` → replaces the placeholders with the **exact saved text** → `export-design` → `document_set_canva`. | 5 |

---

## 11. Resources

None in version 1. Everything is read with tools.

---

## 12. Count

About **36 tools** and **6 prompts**. If the AI gets confused by too many tools, we can add a setting later that turns topics on and off (like GitHub's "toolsets").
