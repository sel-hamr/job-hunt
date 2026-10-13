#!/usr/bin/env bash
# profile_get
# Read the whole profile. Read-only. only_checked: true keeps only the facts I have checked.
# Expected answer: 200, result.structuredContent = { profile, experiences, achievements, skills, ... }

source "$(dirname "$0")/_settings.sh"
need_token

curl -sS -X POST "$BASE_URL/mcp" \
  -H "Authorization: Bearer $MCP_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  --data '{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "tools/call",
  "params": {
    "name": "profile_get",
    "arguments": {
      "only_checked": false
    }
  }
}' \
  -w "\nHTTP %{http_code}\n"
