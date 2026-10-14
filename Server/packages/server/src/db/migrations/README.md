# db/migrations

SQL files that create or change tables. Numbered, run in order by `../migrate.ts`:

- `001_profile.sql`: the profile tables.
- `002_drop_achievement_number.sql`: achievements lose `number` (it stays inside `text`).
- next: `003_jobs.sql`, ...

Rules:
- Name: 3 digits, `_`, a short name, `.sql`. Other files (like this README) are ignored.
- Each file runs inside a transaction: all of it works, or none of it does.
- The database remembers the last number it ran (`PRAGMA user_version`).
- Never edit an old file. Add a new file instead.
- Don't write `BEGIN` or `COMMIT` in a file. `migrate.ts` does that.
