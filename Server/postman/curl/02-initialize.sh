#!/usr/bin/env bash
# initialize (handshake)
# The first message an AI app sends: who it is and which MCP version it speaks. The server answers with its name and what it offers (tools, prompts). The server is stateless, so the other requests also work without it.
# Expected answer: 200, result.serverInfo.name = job-hunt

source "$(dirname "$0")/_settings.sh"
need_token

curl -sS -X POST "$BASE_URL/mcp" \
  -H "Authorization: Bearer $MCP_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  --data '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2025-06-18",
    "capabilities": {},
    "clientInfo": {
      "name": "curl",
      "version": "1.0"
    }
  }
}' \
  -w "\nHTTP %{http_code}\n"
