# FrontEnd: rules for AI agents

Read `README.md` first. It has the plan and all decisions.
Server rules: `Server/AGENTS.md`. Admin API list: `Server/docs/API.md`.

## What this is

A Next.js admin dashboard, only for me, on my computer. It reads and changes data **only through the server's admin API**.

## How to work here

- **The user writes the code by hand.** Explain one small step at a time and **suggest** code in the chat. Don't create or edit source files unless the user clearly asks.
- Before you add a file, read the `README.md` in that folder. Put code where the README says.
- If you add a folder, add a `README.md` to it in the same easy style.
- Talk in **simple English**: short sentences, no hard words.
- Ask first before you add a dependency.

## Layers (always follow)

```
app/ (pages)  ->  features/ (screens + actions)  ->  lib/api/  ->  Server admin API
```

1. **Only `src/lib/api/` calls the server.** Every file there starts with `import "server-only"`, so it can never run in the browser.
2. **Never open SQLite**, and never import server code. Only `@jobhunt/shared` (schemas and types).
3. **`app/` holds pages only.** A page gets data and shows a feature. The real screen lives in `features/`.
4. **Features don't import from each other.** Shared things go to `components/` or `lib/`.
5. **Reading:** Server Components. **Changing:** Server Actions. No API calls from browser code.

## Security rules

- The session lives in an **`httpOnly`** cookie (`sameSite: lax`). Browser JavaScript never reads it.
- `proxy.ts` only **redirects** to `/login`. It is not the real guard. **The server checks the session on every API call.**
- Every Server Action checks its input with the Zod schema from `@jobhunt/shared`. The server checks again.
- Never log passwords or session tokens.
- No sign-up page. The only user is made with a server script.

## Truth rules (same as the server)

- **Never invent facts.** The dashboard shows and edits my data. It never makes data up.
- Only the Review page (with a valid session) can set `checked = yes`.

## Tech

- Next.js (App Router, `src/` folder), TypeScript, Tailwind CSS, shadcn/ui.
- shadcn/ui style `base-nova` (built on **Base UI**, `@base-ui/react`, not Radix). The `cn()` helper comes from the `cn` package (shadcn's own, replaces clsx + tailwind-merge).
- Forms: shadcn **Field** pieces + react-hook-form + Zod (`@hookform/resolvers`). Tables: shadcn Table + TanStack Table. Charts: shadcn Chart (Recharts). Toasts: Sonner.
- `layout.tsx` must wrap the app in `TooltipProvider` (the sidebar needs it).
- Next.js 16 names the middleware file `proxy.ts` (it was `middleware.ts` before). Check the Next.js docs before you write it.
- No tests for now.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the dashboard at `http://localhost:3000`. |
| `npm run build` | Build for production. |
| `npm run lint` | ESLint. |
| `npx next typegen` | Make the route types (`LayoutProps`, `PageProps`). Run it before `npx tsc --noEmit`. |
| `npx shadcn@latest add <name>` | Add a shadcn/ui piece to `src/components/ui/`. |

Note: `npm audit` shows "high" issues from `braces`, inside dev tools only (shadcn CLI, ESLint plugin). **Don't run `npm audit fix --force`**: it downgrades Next's ESLint config and shadcn.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
