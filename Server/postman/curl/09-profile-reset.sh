#!/usr/bin/env bash
# profile_reset (DANGER)
# DANGER: deletes the whole profile and every item, checked or not. Can't be undone. Use a test database (DB_PATH) when you try it.
# Expected answer: 200, deleted = whether there was a profile row, and counts per kind

source "$(dirname "$0")/_settings.sh"
need_token

curl -sS -X POST "$BASE_URL/mcp" \
  -H "Authorization: Bearer $MCP_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  --data '{
  "jsonrpc": "2.0",
  "id": 8,
  "method": "tools/call",
  "params": {
    "name": "profile_reset",
    "arguments": {
      "confirm": "DELETE MY PROFILE"
    }
  }
}' \
  -w "\nHTTP %{http_code}\n"
