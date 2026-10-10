# (dashboard)

Every page after login.

| File / folder | Address | Shows |
|---|---|---|
| `layout.tsx` (later) | | The sidebar + header around every page. |
| `page.tsx` (later) | `/` | **Home**: numbers and charts (`features/home/`). |
| `profile/` | `/profile` | My profile (`features/profile/`). |
| `review/` | `/review` | Items to check (`features/review/`). |
| `jobs/` | `/jobs`, `/jobs/[id]` | My jobs (`features/jobs/`). |

If the server says the session is not valid (401), send me to `/login`.
