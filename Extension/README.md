# Extension

A browser extension that turns the job page I have open into **one prompt that I copy**.
I paste the prompt into Claude (with the Job Hunt MCP server connected), and Claude saves the job.

Status: planning (decided on 2026-10-10). No code yet.

## What it does

```
Job page -> click the extension -> pick a tab -> check the preview -> Copy -> paste into Claude
```

- It **only makes a prompt.** It never talks to the MCP server, and it never sends anything.
- It reads **only the page I have open**, and only when I click. It's not scraping or a robot.
- **My profile is never in the prompt.** Claude gets the profile from the server's tools.

## Decisions

| Topic | Decision |
|---|---|
| Browsers | Chrome, Edge and Brave (Manifest V3). |
| Stack | **WXT** (Vite, hot reload, makes `manifest.json`) + **React** + **Tailwind CSS** + **shadcn/ui**, in TypeScript. |
| Modes (tabs) | **Selected**: the text I highlight. **Full page**: the main content (see below). **AI**: the main text plus job details filled by AI. |
| "Full page" | **Mozilla Readability** (Firefox "Reader view") keeps the main content and removes menus, footers and banners. It **only cuts, it never rewrites words.** If it finds nothing, take all the page text. |
| AI mode text | The selected text if there is a selection, or the Readability main content if not. |
| AI | Claude API, `claude-haiku-5-5`, with a plain `fetch()` (no SDK). Header `anthropic-dangerous-direct-browser-access: true`. |
| AI output | **Only the `job_add` fields**: title, company, city, country, work mode, contract, level, salary (min, max, currency, period), posted date, deadline. Use **structured outputs** (a JSON schema). Any field can be empty. **No requirements**: Claude finds them with the server's rules. |
| Original text | **The AI never replaces it.** In every mode the prompt has the original text, unchanged. That text becomes the job's `full_text`. |
| API key | I paste it once on the settings page. It's stored only in `chrome.storage.local`. **Set a monthly spending limit** on the key in the Claude Console. |
| Popup | 3 tabs -> an **editable preview** -> **Copy** button -> "Copied" toast. |
| Short text warning | Show a warning if the text is short (under about 500 characters). This often means I forgot to click "See more" (LinkedIn and others). |
| Prompt template | Fixed in one file, `src/core/prompt.ts`. To change it, edit the file. |
| Settings page | Only the API key. |

## Folders

Rules for AI agents: `AGENTS.md`. Each folder has its own `README.md`.

```
Extension/
└── src/
    ├── entrypoints/   the doors: popup/, options/ (settings), extract/ (page reader)
    ├── components/    our React pieces (+ ui/ = shadcn/ui)
    ├── hooks/         glue between the screen and the services
    ├── services/      the only code that talks outside: claude/, storage/, page/
    ├── core/          pure logic: prompt, job fields, text tools
    ├── lib/           small helpers
    ├── styles/        Tailwind + theme
    └── public/icon/   icons
```

## The prompt (template in `src/core/prompt.ts`)

```
Save this job with `job_add` (use the original text as full_text, exactly).
Then pull out the requirements with `requirements_set`.

Link: {{url}}
{{ai_fields}}        <- only in AI mode

## Original page text (do not change)
{{job_text}}
```

The prompt names the tools, not the server prompt `analyze_job`, because:
- MCP prompts are started by me (slash command or "+" menu). The AI can't start them.
- `analyze_job` needs a `job_id`, so the job must be saved first.

The rules for requirements (exact quotes, must-have words) live **in the server**, in the `requirements_set` description. See `Server/docs/TOOLS.md`.

## Not now (ideas for later)

- **Hash check:** the extension adds a SHA-256 of the cleaned original text, and `job_add` rejects text that doesn't match. This proves the AI copied `full_text` exactly. It needs a server change first.
- An editable prompt template on the settings page.
- Firefox.
- Sending the job straight to the server over HTTP.
