#!/usr/bin/env bash
# prompts/get import_cv
# The full instruction the AI gets when I pick import_cv. Prompt inputs are always text. cv_text is left out here, so the instruction says to use the CV file attached in the chat.
# Expected answer: 200, result.messages[0].content.text = the instruction

source "$(dirname "$0")/_settings.sh"
need_token

curl -sS -X POST "$BASE_URL/mcp" \
  -H "Authorization: Bearer $MCP_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  --data '{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "prompts/get",
  "params": {
    "name": "import_cv",
    "arguments": {
      "portfolio_url": "https://example.com"
    }
  }
}' \
  -w "\nHTTP %{http_code}\n"
