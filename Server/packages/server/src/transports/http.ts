import { timingSafeEqual } from "node:crypto";
import type { Server } from "node:http";
import { createMcpExpressApp } from "@modelcontextprotocol/express";
import { toNodeHandler } from "@modelcontextprotocol/node";
import { createMcpHandler } from "@modelcontextprotocol/server";
import type { ErrorRequestHandler, RequestHandler } from "express";
import { createApiRouter } from "../api/index.ts";
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

  web.use("/api", createApiRouter(app));

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
