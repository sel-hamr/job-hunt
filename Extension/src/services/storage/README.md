# services/storage

The **only** code that uses `chrome.storage`.

- Saves and reads the Claude API key in `chrome.storage.local` (stays on this computer, not synced).
- Small functions: get key, save key, delete key.
- Later, other settings can live here too.
