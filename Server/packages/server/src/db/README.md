# db (the fridge)

Everything about SQLite. **Only this folder talks to the database.**

All tables, columns and rules are in [docs/DATABASE.md](../../../../docs/DATABASE.md). Read it before you change anything here.

| File / folder (later) | Easy meaning |
|---|---|
| `connection.ts` | Opens the database **one time** for the whole server. The only file that imports `node:sqlite`. Turns on: WAL mode, foreign keys, busy timeout. |
| `migrate.ts` | Runs the files in `migrations/` in order, so the tables are always up to date. |
| `migrations/` | The table changes, step by step. |
| `repositories/` | All SQL queries. |

Notes:
- In Node 24 the class is `DatabaseSync`. In Node 26 it is renamed `Database`. Because only `connection.ts` imports it, the change is one line.
- `node:sqlite` is synchronous: every query stops Node until it finishes. Keep queries small and fast.
- WAL + busy timeout let two servers (stdio and HTTP) use the same file at the same time.
