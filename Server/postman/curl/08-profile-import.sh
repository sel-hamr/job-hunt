#!/usr/bin/env bash
# profile_import
# First setup from a CV, in one call (all or nothing). Only works on an EMPTY profile: run profile_reset first if needed. Skills point to items with proven_by refs.
# Expected answer: 200, counts per kind, ref -> id, not_checked and review_link. On a full profile: isError true, "The profile is not empty"

source "$(dirname "$0")/_settings.sh"
need_token

curl -sS -X POST "$BASE_URL/mcp" \
  -H "Authorization: Bearer $MCP_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  --data '{
  "jsonrpc": "2.0",
  "id": 7,
  "method": "tools/call",
  "params": {
    "name": "profile_import",
    "arguments": {
      "profile": {
        "name": "Sel",
        "headline": "Backend Developer",
        "country": "MA",
        "links": [
          {
            "label": "Portfolio",
            "url": "https://example.com"
          }
        ]
      },
      "experiences": [
        {
          "ref": "acme",
          "company": "Acme",
          "position": "Backend Developer",
          "experience_type": "full-time",
          "start_date": "2022-03",
          "achievements": [
            {
              "text": "Made the API 40% faster",
              "number": "40%"
            }
          ]
        }
      ],
      "projects": [
        {
          "ref": "jobhunt",
          "name": "Job Hunt",
          "links": [
            {
              "label": "GitHub",
              "url": "https://github.com/sel-hamr/job-hunt"
            }
          ]
        }
      ],
      "education": [
        {
          "ref": "school",
          "school": "1337",
          "degree": "Software engineering"
        }
      ],
      "skills": [
        {
          "name": "Node.js",
          "category": "framework",
          "level": "good",
          "proven_by": [
            "acme",
            "jobhunt"
          ]
        }
      ],
      "languages": [
        {
          "language": "English",
          "level": "B2"
        }
      ]
    }
  }
}' \
  -w "\nHTTP %{http_code}\n"
