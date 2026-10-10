# src

All the extension code. WXT reads this folder (`srcDir: "src"` in `wxt.config.ts`).

| Folder | Easy name | Job |
|---|---|---|
| `entrypoints/` | The doors | The parts Chrome opens: the popup, the settings page, and the page reader. |
| `components/` | The pieces | React parts of the screen (tabs, preview, buttons). |
| `hooks/` | The glue | Connect the screen to the services. |
| `services/` | The messengers | The **only** code that talks to the outside: Claude API, browser storage, the open tab. |
| `core/` | The brain | Pure logic: build the prompt, clean text, the job fields shape. No browser, no React. |
| `lib/` | Small helpers | Little tools used everywhere. |
| `styles/` | The paint | Tailwind global CSS and theme colors. |
| `public/` | Files as-is | Icons. Copied into the extension without changes. |
