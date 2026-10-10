# entrypoints (the doors)

WXT reads this folder. Each folder here becomes **one part** of the extension, and WXT adds it to `manifest.json` for us.

| Folder | What Chrome sees | Job |
|---|---|---|
| `popup/` | The popup | Opens when I click the extension icon. |
| `options/` | The settings page | Where I paste my API key. |
| `extract/` | A script put into the page | Reads the job text from the open tab, only when I click. |

No background script for now. The popup does everything while it's open.
