#!/usr/bin/env bash
# POST /api/review/check
# Set checked = true: the ONLY way. 1-50 targets, all or nothing. { type: "profile" } checks the profile row (no id).
# Expected answer: 200 { profile, items }. One unknown id: 404 and nothing is checked
# /api needs no token.

source "$(dirname "$0")/_settings.sh"

curl -sS -X POST "$BASE_URL/api/review/check" \
  -H "Content-Type: application/json" \
  --data '{
  "items": [
    {
      "type": "profile"
    },
    {
      "type": "skill",
      "id": 1
    }
  ]
}' \
  -w "\nHTTP %{http_code}\n"
