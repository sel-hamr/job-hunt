# A tool, from registering to an HTTP call

The full trip: how a tool is registered, then how one tool call goes through HTTP.
The HTTP door is `transports/http.ts`; see `http-door-express.md`.

# Part A: how a tool is registered

## Step 1: write the tool (one file per tool)

`tools/profile/get.ts`:
```ts
export function registerProfileGet(server: McpServer, app: AppContext): void {
  server.registerTool(
    "profile_get",                       // 1. name
    {
      title: "Get my profile",
      description: "Read my whole profile...",            // 2. what the AI reads
      inputSchema: z.object({ only_checked: z.boolean().default(false) }), // 3. input rules
      outputSchema: ProfileWithItemsSchema,                // 4. output rules
      annotations: { readOnlyHint: true },                 // 5. hints
    },
    async ({ only_checked }) => {                          // 6. the work
      const profile = getProfileWithItems(app.db, { onlyChecked: only_checked });
      return {
        content: [{ type: "text", text: JSON.stringify(profile) }],
        structuredContent: profile,
      };
    },
  );
}
```

`registerTool` does **not** run the tool. It only **writes it in the server's list**: "there is a tool called `profile_get`, here are its rules, and here is the function to run".

## Step 2: add it to the list of all tools

`tools/index.ts`:
```ts
export function registerTools(server: McpServer, app: AppContext): void {
  registerProfileGet(server, app);
  registerProfileUpdate(server, app);
  registerProfileImport(server, app);
  registerProfileReset(server, app);
}
```

## Step 3: the factory builds a full server

`server.ts`:
```ts
export function createServer(app: AppContext): McpServer {
  const server = new McpServer({ name: "job-hunt", version: "0.1.0" });
  registerTools(server, app);   // all tools go in the list
  registerPrompts(server);      // all prompts go in the list
  return server;
}
```

After this, the server holds a list like:
```
profile_get     → { schema, description, function }
profile_update  → { schema, description, function }
profile_import  → { schema, description, function }
profile_reset   → { schema, description, function }
```

## Step 4: the HTTP door uses the factory

`transports/http.ts`:
```ts
const mcp = toNodeHandler(createMcpHandler(() => createServer(app)));
web.all("/mcp", requireMcpToken(token), (req, res) => mcp(req, res, req.body));
```

That's all. To add a new tool, you only do **steps 1 and 2**. Steps 3 and 4 never change.

# Part B: one tool call through HTTP

Claude Code wants your checked profile.

## 1. The AI app sends an HTTP request

```http
POST /mcp HTTP/1.1
Host: 127.0.0.1:3001
Authorization: Bearer 9f2c...e81a
Content-Type: application/json
Accept: application/json, text/event-stream

{
  "jsonrpc": "2.0",
  "id": 7,
  "method": "tools/call",
  "params": { "name": "profile_get", "arguments": { "only_checked": true } }
}
```

- The **HTTP part** (`POST /mcp`, headers) is the envelope.
- The **JSON body** is the MCP message. `id: 7` lets the app match the answer to the question.

## 2. Express checks it (`http.ts`)

```
Host 127.0.0.1?          ✓  (else 403)
Origin?                  none, ✓  (else 403)
JSON body → req.body     ✓  (bad JSON → 400)
Bearer token right?      ✓  (else 401)
→ mcp(req, res, req.body)
```

## 3. The SDK handles the MCP part

Inside `mcp(...)`:

1. **`toNodeHandler`** turns the Express `req` into a web `Request`.
2. **`createMcpHandler`** reads the JSON. It sees `method: "tools/call"`.
3. It calls the recipe: **`createServer(app)`**. That builds a new server and fills its tool list.
4. The server looks up **`profile_get`** in its list and finds it.
5. **Input check:** `{ only_checked: true }` against the `inputSchema`. If it's wrong, it answers with an error, and your function never runs.
6. **It runs your function:** `getProfileWithItems(app.db, ...)`, which reads SQLite.
7. **Output check:** `structuredContent` against the `outputSchema`.
8. It wraps the result in a JSON-RPC answer with the **same `id: 7`**.

## 4. The answer goes back

```http
HTTP/1.1 200 OK
Content-Type: text/event-stream

event: message
data: {"jsonrpc":"2.0","id":7,"result":{
        "content":[{"type":"text","text":"{ \"profile\": ... }"}],
        "structuredContent":{ "profile": {...}, "experiences": [...], ... }
      }}
```

(It can come as plain JSON or as a small stream, `event: message`. The SDK picks.)

**`toNodeHandler`** writes it into Express's `res`. The new server is then thrown away, and the database stays open.

## 5. The AI app reads it

Claude gets the result and writes its reply to you: *"Your checked profile has 3 jobs and 12 skills..."*

# The whole trip in one picture

```
Claude Code
  │  POST /mcp  {tools/call profile_get}  + Bearer token
  ▼
http.ts (Express)
  │  Host ✓  Origin ✓  JSON ✓  Token ✓
  ▼
toNodeHandler  →  createMcpHandler
  │                 │ createServer(app)  → new server + tool list
  │                 │ find "profile_get"
  │                 │ check input (Zod)
  │                 ▼
  │              tools/profile/get.ts  →  services/profile.ts  →  db/  →  SQLite
  │                 │
  │                 │ check output (Zod), add id: 7
  ▼                 ▼
HTTP 200 with the result
  │
  ▼
Claude replies to you
```

# What if something goes wrong?

| Problem | Where it stops | Answer |
|---|---|---|
| wrong `Host` or `Origin` | Express | 403 |
| bad JSON body | Express | 400 |
| wrong or missing token | `requireMcpToken` | 401 |
| unknown tool name | SDK | MCP error: tool not found |
| wrong input (e.g. `only_checked: "yes"`) | SDK, with the Zod schema | MCP error listing the problems; your code never runs |
| our rule says no (e.g. "profile is not empty") | service throws `ConflictError` | SDK turns it into `isError: true` with the message |

The last 3 are still **HTTP 200**. The HTTP part worked; the error is **inside** the MCP answer. The AI reads the message and can fix it.
