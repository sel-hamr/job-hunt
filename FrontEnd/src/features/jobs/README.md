# features/jobs

- **Job list:** Data Table with title, company, fit label badge, date. Filters: fit label, show skipped.
- **Job page:** job details, the full text (read-only, it never changes), requirements with type (must-have / nice-to-have), match results (Yes / Partly / No) with their proofs, and the fit label.
- `actions.ts`: `skipJob` (a reason is required), `updateJob` (never `full_text`).

Not here: adding jobs. Jobs come in through Claude (paste or the extension).
