#!/usr/bin/env bash
# POST /api/review/fix
# Fix an item and check it, in one go (a fix I make stays checked). changes holds the item's type. For the profile: { type: "profile", changes }.
# Expected answer: 200, the fixed item with checked: true
# /api needs no token.

source "$(dirname "$0")/_settings.sh"

curl -sS -X POST "$BASE_URL/api/review/fix" \
  -H "Content-Type: application/json" \
  --data '{
  "id": 1,
  "changes": {
    "type": "skill",
    "level": "good"
  }
}' \
  -w "\nHTTP %{http_code}\n"
