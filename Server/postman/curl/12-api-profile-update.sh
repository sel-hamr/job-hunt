#!/usr/bin/env bash
# PATCH /api/profile
# Change my main profile. Send only the fields to change; the first save needs a name. The profile becomes NOT checked.
# Expected answer: 200, the profile with checked: false
# /api needs no token.

source "$(dirname "$0")/_settings.sh"

curl -sS -X PATCH "$BASE_URL/api/profile" \
  -H "Content-Type: application/json" \
  --data '{
  "name": "Sel",
  "headline": "Backend Developer"
}' \
  -w "\nHTTP %{http_code}\n"
