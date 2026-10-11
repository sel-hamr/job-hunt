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
| `updateX(db, id, changes)` | Changes only the fields sent, and sets `updated_at`. Returns `undefined` if the id doesn't exist. |
| `deleteX(db, id)` | `true` if something was deleted. Linked rows go too (`ON DELETE CASCADE`). |

Rules:
- Every function takes `db` first. The database is opened once and passed in.
- Use named parameters (`:name`), never put values into the SQL text. Column names in `updateX` come from a fixed `columns` list.
- Repositories don't decide rules. `updateX` never changes `checked`: the service calls `setItemChecked` (in `checks.ts`) when it must.

Helpers: `../rows.ts` (`now`, `toBool`, `fromBool`, `fromJson`, `toJson`, `orNull`).
