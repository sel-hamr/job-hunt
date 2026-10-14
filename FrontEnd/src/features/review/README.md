# features/review

The place where **I** check items (`checked = yes`). This replaces answering text questions in Claude, which stays as a backup.

- A list of items with `checked = no`, grouped (for example, one job with its achievements).
- For each item: **Check**, **Fix** (edit, then check), or **Skip for now**.
- "Check all in this group", for speed.
- `actions.ts`: `checkItemsAction`, `fixAndCheckAction` (call the admin API).
- `components/review-screen.tsx`: the list. "Skip for now" only hides the item until the page reloads.
- `components/review-skeleton.tsx`: the loading shape.

Rule: **a fix made here stays checked**, because I made it (same rule as the review script).
