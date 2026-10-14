#!/usr/bin/env bash
# GET /api/stats
# The numbers for the dashboard's Home page. Read-only.
# Expected answer: 200 { jobs_total, jobs_by_fit, unchecked_items, top_missing_skills }. Job numbers are 0 until build step 2.
# /api needs no token.

source "$(dirname "$0")/_settings.sh"

curl -sS -X GET "$BASE_URL/api/stats" \
  -w "\nHTTP %{http_code}\n"
