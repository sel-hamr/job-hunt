# services (the cooks)

The real job-hunt work happens here.
Example: "when an item is edited, it becomes not checked".

Rules:
- No MCP code here. Services do not know about tools or doors.
- Services use `db/repositories` to read and write data. No SQL here.
- Services throw the errors from `lib/errors.ts` (`NotFoundError`, `ConflictError`, `RuleError`). Tools and API routes turn them into answers.
- When one action writes more than once, wrap it in `inTransaction` (`db/transaction.ts`).

Why: easy to test, and easy to reuse later (CLI, web page, ...).

## Files

| File | Functions |
|---|---|
| `profile.ts` | `getProfileWithItems(db, { onlyChecked })`, `getItem`, `updateProfile`, `addItem`, `updateItem`, `deleteItem` |
| `skill-years.ts` | `addSkillYears`: each skill's `years` and `work_years`, from the dates of its checked proofs (rules: `docs/DATABASE.md`, part 9). No database: it gets the lists from `getProfileWithItems`. |
| `review.ts` | `listUnchecked`, `checkItems`, `fixAndCheck`: the **only** code that sets `checked = 1` (only the admin API calls it, never a tool) |
| `stats.ts` | `getStats`: the numbers for Home (job numbers are 0 until build step 2) |

`profile.ts` rules:
- A normal edit makes the item (or the profile) **not checked**, in the same transaction as the edit.
- The first profile save needs a `name`.
- Duplicate skill or language, or the same proof twice: `ConflictError` with a clear message.
- A link to a missing item (achievement -> job, proof -> skill or item): `NotFoundError`.
- A new date is checked against the saved one (`end_date` vs saved `start_date`, `expires` vs saved `date`).
- `onlyChecked`: an achievement counts only if its job or project is checked too; a proof only if its skill and its item are checked too. The profile row shows only if it is checked.
- `deleteItem` reports what the cascade removed (`also_deleted`) and `jobs_to_rematch` (empty until jobs exist).

`review.ts` rules:
- `listUnchecked` groups what waits: one group per job and per project (the item, its achievements, the proofs that point to it), then Education, Certificates (each with their proofs), Skills, Languages. Each entry has a one-line `summary`.
- `checkItems` is all or nothing: one wrong id and nothing is checked.
- `fixAndCheck` runs the normal edit (same rules) and then checks it, in one transaction. A skill proof has nothing to fix.
