#!/usr/bin/env bash
# Health check
# Is the server running? No token needed.
# Expected answer: 200 {"ok":true}

source "$(dirname "$0")/_settings.sh"

curl -sS -X GET "$BASE_URL/health" \
  -w "\nHTTP %{http_code}\n"
