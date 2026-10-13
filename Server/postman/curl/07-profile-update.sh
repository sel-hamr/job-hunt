#!/usr/bin/env bash
# profile_update
# Save or change the main profile row. Send only the fields to change; the first save needs a name. The profile becomes NOT checked.
# Expected answer: 200, the saved profile with checked: false, and the review link

source "$(dirname "$0")/_settings.sh"
need_token

curl -sS -X POST "$BASE_URL/mcp" \
  -H "Authorization: Bearer $MCP_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  --data '{
  "jsonrpc": "2.0",
  "id": 6,
  "method": "tools/call",
  "params": {
    "name": "profile_update",
    "arguments": {
      "name": "Sel",
      "headline": "Backend Developer"
    }
  }
}' \
  -w "\nHTTP %{http_code}\n"
