#!/usr/bin/env bash
# DELETE /api/profile/items/:type/:id (DANGER)
# Delete an item, and what the database deletes with it (achievements, skill proofs). Can't be undone: use a test database.
# Expected answer: 200 { deleted, also_deleted: { achievements, skill_proofs }, jobs_to_rematch }
# /api needs no token.

source "$(dirname "$0")/_settings.sh"

curl -sS -X DELETE "$BASE_URL/api/profile/items/skill/1" \
  -w "\nHTTP %{http_code}\n"
