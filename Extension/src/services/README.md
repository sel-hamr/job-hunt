# services (the messengers)

The **only** code that talks to the outside world. Each folder talks to **one** thing.

| Folder | Talks to |
|---|---|
| `claude/` | The Claude API |
| `storage/` | `chrome.storage.local` (the API key) |
| `page/` | The open tab (starts the `extract` script) |

Rules:
- No React here.
- Return clear errors (for example "No API key. Add it in Settings."), so the screen can show them.

Why: if Chrome or the Claude API changes, we fix only one folder.
