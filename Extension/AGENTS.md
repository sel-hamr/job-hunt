# Extension: rules for AI agents

Read `README.md` first. It has the product plan and all decisions.

## What this is

A Chrome / Edge / Brave extension (Manifest V3). On a job page, it builds **one prompt** that I copy and paste into Claude.
It **never** talks to the MCP server.

## How to work here

- **The user writes the code by hand.** Explain one small step at a time and **suggest** code in the chat. Don't create or edit source files unless the user clearly asks.
- Before you add a file, read the `README.md` in that folder. Put code where the README says.
- If you add a folder, add a `README.md` to it in the same easy style.
- Talk in **simple English**: short sentences, no hard words.
- Ask first before you add a dependency or a permission.

## Layers (always follow)

```
entrypoints + components  ->  hooks  ->  services  ->  outside world (Claude API, chrome.storage, the page)

core (pure logic) can be used by all layers.
```

1. **Only `src/services/claude/` calls the Claude API.**
2. **Only `src/services/storage/` uses `chrome.storage`.**
3. **Only `src/entrypoints/extract/` touches the job page.** It only **reads**. It never changes the page.
4. **`src/core/` has no browser APIs and no React.** Only plain TypeScript, so it's easy to test.
5. Components show things. They don't call services directly. They use hooks.

## Truth rules

- **The original page text is never changed by AI.** It always goes in the prompt as it was extracted.
- **The AI fills only the `job_add` fields.** Never requirements.
- **My profile is never in the prompt.**

## Security rules

- **Smallest permissions:** `activeTab`, `scripting`, `storage`. Host permission only for `https://api.anthropic.com/*`. **Never `<all_urls>`**, and no content script that runs on every page.
- **Never log the API key**, and never put it in the code or in git.
- No analytics, no tracking, no other servers.

## Tech

- WXT (`srcDir: "src"`), React, Tailwind CSS, shadcn/ui, TypeScript.
- Claude: `claude-haiku-5-5`, plain `fetch()`, structured outputs. Header `anthropic-dangerous-direct-browser-access: true`.
- shadcn/ui style `base-nova` (built on **Base UI**, `@base-ui/react`). `cn()` comes from the `cn` package.
- Use WXT's `browser` API (typed, from `wxt/browser`) instead of `chrome.*`.
- No tests for now.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Open Chrome with the extension loaded, with hot reload. |
| `npm run dev:edge` | The same in Edge. |
| `npm run build` | Build into `.output/chrome-mv3/` (load it with "Load unpacked"). |
| `npm run compile` | Type-check (`tsc --noEmit`). |
| `npx wxt prepare` | Make the WXT types in `.wxt/`. **Fails until the first entrypoint exists** ("No entrypoints found"): that's normal. |
| `npx shadcn@latest add <name>` | Add a shadcn/ui piece to `src/components/ui/`. |

Setup notes:
- `wxt.config.ts` sets `srcDir: "src"`, the React module, the Tailwind Vite plugin and the **permissions**. Ask first before changing permissions.
- shadcn/ui uses `components.json` (style `base-nova`, `rsc: false`) and `src/styles/globals.css` (same theme as the dashboard). Import `globals.css` in each page's `main.tsx`.
- TypeScript is pinned to **v5** (same as the dashboard). TypeScript 7 drops some options, so don't update it alone.
