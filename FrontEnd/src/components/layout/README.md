# components/layout

The frame around every dashboard page. The look is in `../../../DESIGN.md` (part 4, "The app shell").

| File | What |
|---|---|
| `app-rail.tsx` | The narrow icon rail (desktop): logo, Home, Profile, Review (with the count), Jobs. Labels show as tooltips. Our own piece, not the shadcn Sidebar (that one is fixed to the window edge, so it can't sit inside the sheet). |
| `mobile-nav.tsx` | On phones: a top row with the logo and a menu button that opens the same links in a Sheet. |
| `nav.ts` | The list of pages and their icons. |
| `review-badge.tsx` | How many items wait (from `/api/stats`). Hidden at 0. |
| `top-bar.tsx` | Page title on the left, page actions on the right, then my avatar (`profile-avatar.tsx`: my initials). |
| `section.tsx` | `Section` (title, controls, a 1px rule below) and `EmptyState`. |
| `load-error.tsx` | "Can't load" box with a Retry button. |
| `theme.tsx` | `ThemeProvider` (next-themes: the `.dark` class on `<html>`) and `ThemeToggle`, the sun / moon switch at the bottom of the rail and in the phone top row. |

No user menu (there is no login).
