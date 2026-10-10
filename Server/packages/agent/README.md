# agent (the waiter)

**Optional.** Built last (step 6), only if the user asks. The server works fully without it, in Claude Desktop, VS Code or Claude Code.

A program that talks to Claude and does job-hunt tasks for you.
Example: "Find backend jobs and save the good ones."

It uses two kinds of tools:
- **Server tools** (from our MCP server): save job, check match, save CV, ...
- **Its own tools**: read your CV, score a job, ...

Rule: if any AI app should use a tool -> put it in the **server**. If only the agent needs it -> put it **here**.

The agent **never** opens the database. It asks the server.

Plan: build it with the Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`).
Models: `claude-opus-5-5` (main), `claude-haiku-5-5` (cheap, many small jobs).
