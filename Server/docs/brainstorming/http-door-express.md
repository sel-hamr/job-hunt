# The HTTP door with Express

Status: **built** (`src/transports/http.ts`). This note explains it part by part.
It uses 3 packages: `express` 5, `@modelcontextprotocol/express` 2, `@types/express` 5 (dev only).

## The big picture

The server is like a building with 3 doors:

| Door | Who uses it | What it needs |
|---|---|---|
| `/health` | anyone on your computer | nothing: it only says "I'm alive" |
| `/mcp` | AI apps (Claude Code and others) | the **MCP token**, a password |
| `/api` | the dashboard | a **login session** (comes with the login step) |

`http.ts` is the guard at the doors. It checks who is coming in, then sends them to the right place.

## The code

```ts
import { timingSafeEqual } from "node:crypto";
import type { Server } from "node:http";
import { createMcpExpressApp } from "@modelcontextprotocol/express";
import { toNodeHandler } from "@modelcontextprotocol/node";
import { createMcpHandler } from "@modelcontextprotocol/server";
import type { ErrorRequestHandler, RequestHandler } from "express";
import { createServer, type AppContext } from "../server.ts";

export type HttpOptions = {
  host: string;
  port: number;
  authToken: string; // the MCP token: AI apps send it as "Authorization: Bearer <token>"
};

// The HTTP door: /mcp for AI apps, /api for the dashboard, /health to see if the server runs.
// All HTTP safety lives here.
export function startHttp(app: AppContext, options: HttpOptions): Promise<Server> {
  // On 127.0.0.1 this already checks Host and Origin (stops DNS rebinding) and parses JSON bodies.
  const web = createMcpExpressApp({ host: options.host, jsonLimit: "1mb" });
  web.disable("x-powered-by");

  // v2 HTTP is stateless: a new MCP server for every request, all sharing the one open database.
  const mcp = toNodeHandler(
    createMcpHandler(() => createServer(app), {
      onerror: (err) => console.error(`mcp error: ${err.message}`),
    }),
  );

  web.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  web.all("/mcp", requireMcpToken(options.authToken), async (req, res) => {
    await mcp(req, res, req.body); // the body is already parsed by Express
  });

  // The /api routes (and their session check) come with the login step.
  web.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });
  web.use(jsonErrors);

  return new Promise((resolve, reject) => {
    const server = web.listen(options.port, options.host, (err) => (err ? reject(err) : resolve(server)));
  });
}

// Compares in constant time, so the answer time gives no hint about the token.
function requireMcpToken(token: string): RequestHandler {
  const expected = Buffer.from(token);
  return (req, res, next) => {
    const header = req.get("authorization") ?? "";
    const sent = Buffer.from(header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "");
    if (sent.length === expected.length && timingSafeEqual(sent, expected)) return next();
    res.set("WWW-Authenticate", "Bearer").status(401).json({ error: "Missing or wrong MCP token" });
  };
}

// Any error (a bad JSON body, a crash in a route) answers JSON, never an HTML page.
const jsonErrors: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = typeof err?.status === "number" ? err.status : 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? "Server error" : err.message });
};
```

## Part by part

### The imports

- **`timingSafeEqual`** compares two passwords safely (see "The password check").
- **`Server`** is the type of a running HTTP server.
- **`createMcpExpressApp`** makes an Express app with safety checks already added.
- **`createMcpHandler`** is the part that speaks the MCP language.
- **`toNodeHandler`** connects that MCP part to Express.
- **`ErrorRequestHandler`, `RequestHandler`** are Express types, only for TypeScript.
- **`createServer`** is our own factory: it builds an MCP server with all our tools.

### The settings

- **`host`**: which address to listen on. `127.0.0.1` means only your own computer.
- **`port`**: the door number, like `3001`.
- **`authToken`**: the MCP password.

### Make the app

`createMcpExpressApp` gives an Express app with 3 things already added:

1. **A `Host` check.** Every request says which name it was sent to (`localhost`, `evil.com`...). Only local names are allowed. This stops **DNS rebinding**: a bad website trying to reach a server on your computer.
2. **An `Origin` check.** A browser says which website sent the request. If it is not a local site, the request is refused with 403.
3. **A JSON reader.** It turns the body into a JS object, `req.body`. `"1mb"` is the biggest body it accepts, so a big CV import fits (Express's default is 100 KB).

It adds **no CORS headers**, which is what we want: a browser page can't read our answers.
`web.disable("x-powered-by")` stops Express from telling everyone "I am Express".

### The 3 doors

- **`/health`** answers `{ "ok": true }`: a quick way to see that the server runs.
- **`/mcp`** (`web.all` = any method) first runs `requireMcpToken`, then `mcp(...)`. We pass `req.body` because Express already read the body, and a body can only be read once.
- **Everything else** gets 404, including `/api` until the login step.
- **`jsonErrors`** catches any error and answers JSON.

`web.listen(...)` opens the door. If it works, the Promise **resolves** with the server, and `index.ts` keeps it to close it on Ctrl+C. If it fails (for example the port is already used), it **rejects**, and `index.ts` prints a clear message.

### The password check (`requireMcpToken`)

It is a **middleware**: a small function that runs **before** the real route.

1. It reads the `Authorization` header: `Authorization: Bearer abc123...`.
2. It removes `"Bearer "` and keeps the token. No header = empty token.
3. It compares with the real token:
   - the **same length** first: `timingSafeEqual` only works when the lengths match.
   - **`timingSafeEqual`**: a normal `===` stops at the first wrong letter, so a wrong start answers a tiny bit faster. An attacker could measure that and guess the token letter by letter. `timingSafeEqual` always takes the same time.
4. Match → **`next()`**: "go on to the route".
5. No match → **401** with `WWW-Authenticate: Bearer` ("you need a Bearer token").

### The error catcher (`jsonErrors`)

Express knows it is an error catcher because it has **4 parameters**.

- `status`: some errors carry their own code (bad JSON = 400). If not, **500**.
- A 500 is our bug, so we log it.
- A 400 shows its message, which helps the caller fix the request. A 500 only says `"Server error"`: inner details could leak secrets.

Without it, Express would answer with an HTML error page.

## Questions

### Why `import type { Server } from "node:http"`? Why not an Express server?

Express has no server of its own. It runs **on top of** Node's server.

| | What it is | Its job |
|---|---|---|
| `web` (the Express app) | a function that handles requests | decides what to answer |
| `Server` (from `node:http`) | the real server | opens the port and gives each request to `web` |

`web.listen(...)` does this inside:
```ts
const server = http.createServer(web); // Node's server, with Express as the handler
server.listen(3001, "127.0.0.1");
return server;                        // gives back Node's server
```

We keep that server to **stop** it on Ctrl+C (`close()` and `closeAllConnections()` exist only on it).
`import type` means "only the type, for TypeScript": it disappears when the code runs.

### What does the token check compare with?

**The token the AI app sends** with **the token in `AUTH_TOKEN`**.

The real token comes from:
```
.env               AUTH_TOKEN=9f2c...e81a
   ↓
config/index.ts    reads it, checks it is 32+ characters
   ↓
index.ts           startHttp(app, config.transport)
   ↓
http.ts            requireMcpToken(options.authToken)
```

`requireMcpToken` runs **once**, at start. It saves the token in `expected` and **returns a new function**. That inner function remembers `expected` (a **closure**), and Express runs it on every `/mcp` request.

The AI app gets the token once, when you add the server, for example in Claude Code:
```
claude mcp add --transport http job-hunt http://127.0.0.1:3001/mcp --header "Authorization: Bearer 9f2c...e81a"
```
Make a token with:
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### How does `next()` work?

Express runs a route as a **chain of links**, in order:

| What the link does | What happens |
|---|---|
| calls **`next()`** | "I'm done, run the next link." |
| **answers** and doesn't call `next()` | the chain **stops here** |

The full chain for one `/mcp` request:
```
1. Host check        bad → 403, stop
2. Origin check      bad → 403, stop
3. JSON reader       puts the body in req.body
4. requireMcpToken   bad → 401, stop
5. mcp(...)          runs the tool and answers
```
A request reaches the database only if it passes all 4 checks.

### What does `const mcp = toNodeHandler(createMcpHandler(...))` do?

Read it **from the inside out**:

```
toNodeHandler(                          ← 3: makes it work with Express
  createMcpHandler(                     ← 2: speaks MCP over HTTP
    () => createServer(app),            ← 1: builds our MCP server with our tools
    { onerror: ... }                    ← logs problems
  )
)
```

1. **`() => createServer(app)`** is a **recipe**, not a server: a function that builds a new server each time it is called.
2. **`createMcpHandler`** reads each MCP message, calls the recipe, gives the message to the new server (which runs the tool), and turns the result into an HTTP answer. `onerror` only logs; the SDK still sends the right error answer.
3. **`toNodeHandler`** is a translator. `createMcpHandler` speaks the **web-standard** style (`fetch(request) → response`), but Express uses **Node-style** `req` and `res`.

```
Express req ──► toNodeHandler ──► web Request ──► MCP worker
Express res ◄── toNodeHandler ◄── web Response ◄──┘
```

### Do we really make a new MCP server for each request?

Yes, in HTTP mode. But only the small server object is new.

| New for each request | Shared by every request (made once at start) |
|---|---|
| the `McpServer` object | the database connection (`app.db`): the expensive part |
| its list of tools and prompts | the settings, the Express app, the HTTP server |
| | all the code: services, repositories, schemas |

It takes much less than a millisecond. The SDK does it so nothing leaks between requests, and there are no sessions to lose if the server restarts.

| | stdio (Claude Desktop now) | HTTP |
|---|---|---|
| MCP servers | **one** for the whole connection | **one per request** |
| Database | opened once | opened once |

So: **never keep data in a variable** inside `createServer` or a tool (like a counter or a cache). It would be gone after the request. Lasting data goes in the **database**.

## Planned settings (`config/index.ts`)

| Env var | Default | Rule |
|---|---|---|
| `TRANSPORT` | `stdio` | `stdio` or `http` |
| `HOST` | `127.0.0.1` | |
| `PORT` | `3001` | the dashboard uses 3000 |
| `AUTH_TOKEN` | none | needed when `TRANSPORT=http`, 32+ characters |
