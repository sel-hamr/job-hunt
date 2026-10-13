#!/usr/bin/env bash
# prompts/list
# Every prompt (ready-made instruction) and its inputs.
# Expected answer: 200, result.prompts = import_cv

source "$(dirname "$0")/_settings.sh"
need_token

curl -sS -X POST "$BASE_URL/mcp" \
  -H "Authorization: Bearer $MCP_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  --data '{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "prompts/list",
  "params": {}
}' \
  -w "\nHTTP %{http_code}\n"
