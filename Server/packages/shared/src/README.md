# shared/src

One file per topic. `common.ts` and `index.ts` exist; the others are still plans. The fields of each shape: `docs/SHARED.md`, part 7.

| File | Shapes |
|---|---|
| `common.ts` | building blocks: id, CV date, timestamp, source, check fields, link, country, currency, page query |
| `errors.ts` | the error answer: `{ error, problems }` |
| `auth.ts` | login input, session answer, `me` |
| `stats.ts` | the Home numbers |
| `profile.ts` | the profile and every item kind |
| `review.ts` | review groups, check input, fix input |
| `jobs.ts` | job list, one job, requirement, match, update and skip input |
| `index.ts` | exports everything. Imports end in `.ts` (`export * from "./common.ts"`). |
