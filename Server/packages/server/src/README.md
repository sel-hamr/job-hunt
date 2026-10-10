# server/src

Two main files will live here (not created yet):

| File | Easy meaning |
|---|---|
| `index.ts` | **Start button.** Reads settings, opens the database one time, then opens the stdio door or the HTTP door. Closes the database when the server stops. |
| `server.ts` | **The menu.** Builds the MCP server and adds all tools, resources and prompts. It does not know which door is used. |

Note: the old `src/mcp.ts` at the top of the project is empty. Its job moves to `index.ts` here.
