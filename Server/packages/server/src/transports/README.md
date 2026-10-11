# transports (the doors)

| File | Door | Easy meaning |
|---|---|---|
| `stdio.ts` | stdio | The app starts the server and talks through stdin/stdout, with `serveStdio` from `@modelcontextprotocol/server/stdio`. **Never print to stdout here** - it breaks the connection. Logs go to stderr. |
| `http.ts` (later) | Streamable HTTP | The server listens on `/mcp` (AI apps) and `/api` (the dashboard). All safety lives here: check the MCP token on `/mcp`, check the **session** on `/api` (with the auth service), check the `Host` and `Origin` headers, and a `/health` page. |

The `/api` routes live in `src/api/`. This door only sends requests to them.

Doors only connect. They have no job-hunt logic. Both use the same factory, `createServer(app)` in `../server.ts`.
