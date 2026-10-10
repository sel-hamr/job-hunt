# src

All the dashboard code.

| Folder / file | Easy name | Job |
|---|---|---|
| `proxy.ts` (later) | The doorman | No session cookie -> go to `/login`. Only a redirect, not the real guard (the server is). |
| `app/` | The map | Pages and addresses (routes). Thin. |
| `features/` | The rooms | One folder per topic: its screens, forms and Server Actions. |
| `components/` | The shared pieces | shadcn/ui pieces and the layout (sidebar, header). |
| `lib/` | The tools | The API client (only code that calls the server), session helpers, small utils. |
