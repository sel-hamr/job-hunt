# db/repositories

All SQL queries. One file for each table.
Example: `jobs.ts` has "insert job", "find job by id", "list jobs".

SQL lives **only here**. Tools and services never write SQL.

## The pattern (copy `experiences.ts`)

Each file has:

| Part | Job |
|---|---|
| `XRow` type | One row as SQLite gives it back (`0`/`1`, JSON text, column names). |
| `toX(row)` | Row -> the shared shape from `@jobhunt/shared`: `0`/`1` -> `true`/`false`, JSON text -> list, adds `type: "x"`. |
| `insertX(db, input, source)` | Saves a new item. Missing fields become `NULL` (`orNull`), because `node:sqlite` refuses `undefined`. Returns the saved item. |
| `getX(db, id)` | One item, or `undefined`. |
| `listX(db)` | All items, in the order the CV shows them. |
| `updateX(db, id, changes)` | Calls `updateRow` (in `update.ts`) with a fixed `columns` list: changes only the fields sent, and sets `updated_at`. Returns `undefined` if the id doesn't exist. |
| `deleteX(db, id)` | `true` if something was deleted. Linked rows go too (`ON DELETE CASCADE`). |

Rules:
- Every function takes `db` first. The database is opened once and passed in.
- Use named parameters (`:name`), never put values into the SQL text. Column names in `updateX` come from a fixed `columns` list.
- Repositories don't decide rules. `updateX` never changes `checked`: the service calls `setItemChecked` (in `checks.ts`) when it must.

## Files

| File | Table |
|---|---|
| `profile.ts` | `profile` (1 row, id = 1): `getProfile`, `insertProfile`, `updateProfile`, `setProfileChecked` |
| `experiences.ts`, `achievements.ts`, `skills.ts`, `skill-proofs.ts`, `projects.ts`, `education.ts`, `certificates.ts`, `languages.ts` | one per item kind |
| `checks.ts` | `setItemChecked(db, type, id, checked)` for every item kind |
| `update.ts` | `updateRow`: the shared "change only the sent fields" helper |

Notes:
- `skill_proofs` has no update (delete and add a new one). `achievements` can't change their job / project link.
- `skills.name` and `languages.language` are unique, upper/lower case ignored: a duplicate insert throws a UNIQUE error. `findSkillByName` checks first.

Helpers: `../rows.ts` (`now`, `toBool`, `fromBool`, `fromJson`, `toJson`, `orNull`, `toSqlValue`).
