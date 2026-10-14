#!/usr/bin/env bash
# GET /api/review
# Everything that waits for my check, grouped (one group per job and per project, then by kind). Read-only.
# Expected answer: 200 { profile, groups: [{ key, title, entries: [{ item, summary }] }], total }
# /api needs no token.

source "$(dirname "$0")/_settings.sh"

curl -sS -X GET "$BASE_URL/api/review" \
  -w "\nHTTP %{http_code}\n"
