# server (the kitchen)

The MCP server. It works in two ways (two "doors"):
- **stdio**: a local app (Claude Desktop, VS Code, our agent) starts the server and talks to it directly.
- **Streamable HTTP**: the server runs on its own, and apps connect over the network at `/mcp`.

Both doors use the **same tools**. Tools are written once.

Needs Node.js 24 or newer (for `node:sqlite`).
MCP SDK: v2 packages `@modelcontextprotocol/server` + `@modelcontextprotocol/node` (not the old v1 `@modelcontextprotocol/sdk`).
