# db/migrations

SQL files that create or change tables. Numbered, run in order:

- `001_create_jobs.sql`
- `002_create_applications.sql`
- ...

Rules:
- Never edit an old file. Add a new file instead.
- The database remembers the last number it ran (`PRAGMA user_version`).
