# lib (small helpers)

Small things used everywhere:
- `errors.ts`: the error kinds services throw. `NotFoundError` (API 404), `ConflictError` (409), `RuleError` (400). All extend `AppError`.
- logger (later): writes to **stderr** only, so stdio is safe.
