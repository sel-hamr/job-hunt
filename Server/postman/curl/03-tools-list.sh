#!/usr/bin/env bash
# tools/list
# Every tool, with its description and input schema. This is what the AI reads to pick a tool.
# Expected answer: 200, result.tools = profile_get, profile_update, profile_import, profile_reset

source "$(dirname "$0")/_settings.sh"
need_token

curl -sS -X POST "$BASE_URL/mcp" \
  -H "Authorization: Bearer $MCP_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  --data '{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list",
  "params": {}
}' \
  -w "\nHTTP %{http_code}\n"
