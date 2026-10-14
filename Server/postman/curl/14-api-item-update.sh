#!/usr/bin/env bash
# PATCH /api/profile/items/:type/:id
# Change an item. The kind and id come from the address (change them to an item from 11). If it was checked, it becomes NOT checked.
# Expected answer: 200, the item with checked: false. Unknown id: 404
# /api needs no token.

source "$(dirname "$0")/_settings.sh"

curl -sS -X PATCH "$BASE_URL/api/profile/items/skill/1" \
  -H "Content-Type: application/json" \
  --data '{
  "level": "expert"
}' \
  -w "\nHTTP %{http_code}\n"
