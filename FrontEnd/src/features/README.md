# features (the rooms)

One folder per topic. Each folder has what it needs:

| Inside a feature | Easy meaning |
|---|---|
| `components/` | The screens and forms of this topic. |
| `actions.ts` | Server Actions (add, edit, delete, ...). Check input with Zod, call `lib/api/`, then refresh the page. |

| Folder | Topic |
|---|---|
| `auth/` | Login form, login and logout. |
| `home/` | Numbers and charts. |
| `profile/` | My info and profile items. |
| `review/` | Checking items. |
| `jobs/` | Job list and job page. |

Rule: **features don't import from each other.** If two features need the same thing, move it to `components/` or `lib/`.
