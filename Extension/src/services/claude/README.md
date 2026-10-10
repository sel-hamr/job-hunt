# services/claude

The **only** code that calls the Claude API.

- Model: `claude-haiku-5-5`.
- Plain `fetch()` to `https://api.anthropic.com/v1/messages`. No SDK.
- Headers: `x-api-key`, `anthropic-version`, `content-type`, and `anthropic-dangerous-direct-browser-access: true`.
- Uses **structured outputs** with the job fields schema from `core/`, so the answer always has the same shape.
- Asks only for the **`job_add` fields**. Never requirements.
- Clear errors: no key, wrong key (401), rate limit (429), no internet.
- Never log the key.
