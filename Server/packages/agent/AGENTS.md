# Agent: rules for AI agents

Also follow the root `AGENTS.md`.

## What the agent is

- A program that uses Claude to do job-hunt tasks, for example "find backend jobs and save the good ones".
- It is built with the **Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk`). Read its docs at `code.claude.com/docs/en/agent-sdk` before you write SDK code. Do not guess API names.
- Models: `claude-opus-5-5` for the main agent, `claude-haiku-5-5` for cheap work in bulk (for example, scoring many job posts).

## Rules

- **Never open the SQLite file.** Read and write data only through the server's MCP tools.
- The connection to the server lives in `src/mcp/`. In dev, start the server over stdio. Later, connect over HTTP with a URL and token. The rest of the agent must not care which one is used.
- The agent's own tools go in `src/tools/`, one file per tool. Add a tool here only if no other AI app needs it. Otherwise it belongs in the server.
- Turn on only the built-in SDK tools the agent needs, such as web search. Keep bash and file writing off unless a task needs them.
- Prompts are text files in `src/prompts/`. Keep them stable between runs, because changing them breaks prompt caching and costs more.
- Read the API key from the environment. Never commit secrets, and list every env var in `.env.example`.
- Log the tokens and cost of each run (`src/lib/`).
