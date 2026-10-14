#!/usr/bin/env bash
# POST /api/profile/items
# Add an item: type + the fields of that kind. It starts NOT checked, with source: manual.
# Expected answer: 201, the new item. A skill name you already have: 409
# /api needs no token.

source "$(dirname "$0")/_settings.sh"

curl -sS -X POST "$BASE_URL/api/profile/items" \
  -H "Content-Type: application/json" \
  --data '{
  "type": "skill",
  "name": "Docker",
  "category": "tool",
  "level": "good",
  "other_names": [
    "Docker Compose"
  ]
}' \
  -w "\nHTTP %{http_code}\n"
