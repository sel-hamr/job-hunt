# app (the map)

Next.js App Router. Each folder is an address. **Pages only**: a page gets data from `lib/api/` and shows a screen from `features/`.

| Folder | Address | Easy meaning |
|---|---|---|
| `(dashboard)/` | `/` and below | Every page, with the sidebar layout. |

Folders in `( )` are **route groups**: they share a layout, but their name is not in the address.

Files here: `layout.tsx` (the root layout: font, desk background, `TooltipProvider`, `Toaster`), `globals.css` (Tailwind + the Paper Mono theme: light, and dark with the Midnight Ember colors). The root layout also wraps the app in `ThemeProvider` (`components/layout/theme.tsx`).
