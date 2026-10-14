#!/usr/bin/env bash
# GET /api/profile
# My profile and every item, grouped by kind. Read-only.
# Expected answer: 200 { profile, experiences, achievements, skills, skill_proofs, projects, education, certificates, languages }
# /api needs no token.

source "$(dirname "$0")/_settings.sh"

curl -sS -X GET "$BASE_URL/api/profile" \
  -w "\nHTTP %{http_code}\n"
