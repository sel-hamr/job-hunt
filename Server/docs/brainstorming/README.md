# brainstorming (learning notes)

Notes to understand how things work, in easy English. They explain; they don't decide.
The rules live in the main docs (`../TOOLS.md`, `../API.md`, `../DATABASE.md`, `../SHARED.md`). If a note and a main doc disagree, the main doc wins.

| File | What it explains |
|---|---|
| `mcp-guide.md` | What MCP is, the roles, tools / prompts / resources, transports, what the SDK does, and our layers |
| `tool-over-http.md` | How a tool is registered, and the full trip of one tool call through HTTP |
| `http-door-express.md` | `transports/http.ts` with Express, part by part |
| `find-jobs.md` | How Claude Desktop + Claude in Chrome + our server find and save jobs with the `find_jobs` prompt (not built yet) |
