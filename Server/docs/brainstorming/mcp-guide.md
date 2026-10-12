# MCP and the SDK: a short guide

## 1. What is MCP?

**MCP (Model Context Protocol)** is a common language that lets an AI app use **your** programs.

Without MCP, Claude can only talk. With MCP, Claude can **do things**: read your profile, save a CV, find jobs.

```
You  ⇄  AI app (Claude Desktop)  ⇄  MCP  ⇄  Our server (job-hunt)  ⇄  Database
```

## 2. The 3 roles

| Role | Who | Job |
|---|---|---|
| **Host** | Claude Desktop, Claude Code | the app you chat in |
| **Client** | a small part inside the host | talks MCP to one server |
| **Server** | **our job-hunt code** | gives tools to the AI |

One host can connect to many servers: job-hunt, GitHub, Canva, and so on.

## 3. What a server can give

| Thing | What it is | Who picks it | Ours |
|---|---|---|---|
| **Tools** | actions the AI can call | **the AI** chooses | `profile_get`, `profile_import`, ... |
| **Prompts** | ready instructions | **you** choose, from the + menu | `import_cv` |
| **Resources** | files or data to read | the app | none yet |

Tools are the main part.

## 4. How a conversation works

Every message is **JSON-RPC**: small JSON messages, each with a `method`.

**1. Start (handshake)**
```
Client → initialize           "Hi, I'm Claude, I speak MCP version X"
Server → result               "Hi, I'm job-hunt, I have tools and prompts"
```

**2. Discover**
```
Client → tools/list
Server → [ profile_get, profile_update, profile_import, profile_reset ]
          each with: name, description, input schema
```
The AI **reads the descriptions** to decide when to use each tool. That is why good descriptions matter so much: they are the only instructions the AI gets.

**3. Use**
```
Client → tools/call  { name: "profile_get", arguments: { only_checked: true } }
Server → result      { content: [text...], structuredContent: {...} }
```

**4. The AI writes its reply to you,** using the result.

## 5. Transports (the "doors")

MCP messages need a road to travel on:

| Transport | How it works | When |
|---|---|---|
| **stdio** | the app **starts our process** and talks through stdin and stdout | Claude Desktop, local use |
| **HTTP** | our server **runs by itself** on a port, and apps send HTTP requests to `/mcp` | dashboard, Claude Code, many apps at once |

The messages are the same on both. Only the road changes. That's why both doors use the same `createServer(app)`.

**stdio rule:** stdout **is** the road. Printing anything there (like `console.log`) breaks the connection, so we log with `console.error`.

## 6. The SDK: what it does for you

The SDK (`@modelcontextprotocol/server`) handles all the protocol work:
- reading and writing JSON-RPC
- the handshake
- `tools/list`, built from what you register
- **checking inputs with your Zod schema** before your code runs
- turning a thrown error into an error answer for the AI

You only write: **what each tool does.**

## 7. The SDK in our code

**Create a server, then register tools:**
```ts
const server = new McpServer({ name: "job-hunt", version: "0.1.0" });

server.registerTool(
  "profile_get",                         // name
  {
    title: "Get my profile",
    description: "Read my whole profile...", // the AI reads this
    inputSchema: z.object({ ... }),          // SDK checks input
    outputSchema: ProfileWithItemsSchema,    // SDK checks output
    annotations: { readOnlyHint: true },     // hints for the app
  },
  async (input) => {                     // your code
    const profile = getProfileWithItems(app.db, ...);
    return {
      content: [{ type: "text", text: "..." }], // text for the AI
      structuredContent: profile,               // JSON for the AI and apps
    };
  },
);
```

**A prompt is the same idea:**
```ts
server.registerPrompt("import_cv", { title, description, argsSchema }, (args) => ({
  messages: [{ role: "user", content: { type: "text", text: "...instruction..." } }],
}));
```

**Start a door:**
```ts
serveStdio(() => createServer(app));            // stdio (we have this)
createMcpHandler(() => createServer(app));      // HTTP (transports/http.ts)
```
Both take a **recipe** `() => createServer(app)`, not a ready server.

## 8. Our layers

```
AI app
  ↓ MCP (stdio or HTTP)
transports/   the doors: stdio.ts, http.ts (safety lives here)
  ↓
server.ts     createServer(app): one McpServer with all tools and prompts
  ↓
tools/        check input → call a service → answer   (no SQL)
prompts/      only build instruction text
  ↓
services/     the rules (empty profile only, not checked after edit, ...)
  ↓
db/           repositories: the only place with SQL
  ↓
SQLite
```

The dashboard will later use `/api`, which calls **the same services**. So the rules are always the same, whoever calls them.

## 9. Important ideas to remember

| Idea | Why |
|---|---|
| **Descriptions are instructions** | The AI only knows what you write there, like "always show the review link". |
| **The AI sees the tool answer; you often don't** | Claude Desktop folds it away, so put what you must see in the answer **and** ask the AI to show it. |
| **Use `structuredContent` too** | Some apps give the AI only the JSON part. |
| **Hints** | `readOnlyHint` = safe to call, `destructiveHint` = the app asks you first. |
| **Return all errors at once** | The AI fixes everything in one try. |
| **Stateless HTTP** | A new McpServer per request, one shared database. Keep data in the DB, not in variables. |
| **No secrets for the AI** | The AI has the MCP token, but never your login, so it can never mark items as checked. |

## 10. How to try things by hand

- **Claude Desktop:** edit its config, restart it fully, and the tools appear.
- **MCP Inspector:** `npx @modelcontextprotocol/inspector`. It's a web page where you can call each tool and see the raw JSON.
- **Our scripts:** `npm run show-profile` shows what was really saved.

That's the whole picture: **MCP is the language, the SDK speaks it for you, and you write the tools.**
