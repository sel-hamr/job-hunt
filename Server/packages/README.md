# packages

This project has **two programs** and **one shared package**:

| Folder | Easy name | Job |
|---|---|---|
| `server/` | The kitchen | The MCP server. Keeps job data in SQLite. Gives tools to any AI app (`/mcp`) and an admin API to the dashboard (`/api`). |
| `agent/` | The waiter | Talks to Claude. Has its own tools. Asks the server for data. **Optional, built last.** |
| `shared/` | The common language | `@jobhunt/shared`: data shapes (Zod schemas) used by the server and the dashboard. |

Rule: **only the server touches the database.** The agent and the dashboard always ask the server.

```
You  ->  Agent        ->  MCP Server (/mcp)  ->  SQLite
You  ->  Dashboard    ->  MCP Server (/api)  ->  SQLite
```

Outside this folder (in `Job Hunt/`): `FrontEnd/` (the dashboard) and `Extension/` (the browser extension).
