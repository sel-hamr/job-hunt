# config (the settings)

Reads settings one time at start, and checks they are correct:
- which door: `stdio` or `http`
- port and host for HTTP (host is `127.0.0.1` by default, for safety)
- auth token (password) for HTTP
- database file path (`DB_PATH`)

If a setting is wrong, the server stops with a clear message.

Where settings come from:
- `npm run dev` reads `packages/server/.env` if it exists. Copy `.env.example` to `.env` to start. Never commit `.env`.
- Apps like Claude Desktop pass settings in their own config (`env` block), not from `.env`.
- The code is in `index.ts`: `EnvSchema` lists every setting and its rules. To add a setting, add one line there.
