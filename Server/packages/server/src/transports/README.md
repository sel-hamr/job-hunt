# transports (the doors)

| File | Door | Easy meaning |
|---|---|---|
| `stdio.ts` | stdio | The app starts the server and talks through stdin/stdout, with `serveStdio` from `@modelcontextprotocol/server/stdio`. **Never print to stdout here** - it breaks the connection. Logs go to stderr. |
| `http.ts` | Streamable HTTP, with **Express 5** | The server runs by itself (`TRANSPORT=http`) and listens on `127.0.0.1:3001`. `createMcpExpressApp` (from `@modelcontextprotocol/express`) adds the `Host` and `Origin` checks and the JSON parser. `/mcp` needs the MCP token (`Authorization: Bearer <AUTH_TOKEN>`). `/health` answers `{ "ok": true }`. `/api` answers 404 until the login step, which adds the **session** check. Errors are always JSON, and there are no CORS headers. |

The `/api` routes live in `src/api/`. This door only sends requests to them.

Doors only connect. They have no job-hunt logic. Both use the same factory, `createServer(app)` in `../server.ts`.
