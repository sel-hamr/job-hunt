# postman (try the server's HTTP requests by hand)

The requests the server answers **today**, ready to send:
- **Postman**: import the collection and the environment, then click Send.
- **curl**: one script per request in `curl/`.

Both have the same 9 requests, in the same order, with the same bodies.
Today the server has 2 addresses: `/health`, and `/mcp` (MCP over HTTP) with 4 tools and 1 prompt. There is no `/api` address yet.
What the HTTP door does and why: `../docs/brainstorming/http-door-express.md`. The tools: `../docs/TOOLS.md`.

| File | What it is |
|---|---|
| `job-hunt.postman_collection.json` | The Postman collection: 9 requests in 4 folders. Each request has a description and the expected answer. |
| `job-hunt.postman_environment.json` | The Postman environment: `baseUrl` and `mcpToken` (empty: put your token there in Postman, never commit it). |
| `curl/` | One curl script per request, plus `_settings.sh` (address and token). |

## 1. Start the server on HTTP

In `packages/server/.env`:

```
TRANSPORT=http
AUTH_TOKEN=<your token, 32+ characters>
```

Make a token with:

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then, from `Server/`:

```
npm run dev
```

It prints `job-hunt MCP server ready on http://127.0.0.1:3001`.

**Use a test database** when you try `profile_reset` or `profile_import`: they change your real profile. For example, add `DB_PATH=./data/test.sqlite` to `.env`, or run with `DB_PATH=:memory:` (a database that lives only until the server stops).

## 2. With Postman

1. **Import** both files (File → Import).
2. Pick the **job-hunt local** environment (top right).
3. Put your `AUTH_TOKEN` in **`mcpToken`**.
4. Open a request and click **Send**.

The token is set once, on the collection (Authorization → Bearer `{{mcpToken}}`). Every `/mcp` request uses it. `/health` needs no token.

## 3. With curl

From `Server/` (in Git Bash on Windows):

```
bash postman/curl/01-health.sh
bash postman/curl/03-tools-list.sh
```

`curl/_settings.sh` finds the address and the token:
- `BASE_URL`: default `http://127.0.0.1:3001`.
- `MCP_TOKEN`: if you don't set it, it is read from `AUTH_TOKEN` in `packages/server/.env`.

```
MCP_TOKEN=abc... bash postman/curl/06-profile-get.sh
```

Each script prints the answer, then `HTTP <status>` on the last line.

## 4. The requests

| # | Request | curl | What it does | Expected answer |
|---|---|---|---|---|
| 01 | Health check | `curl/01-health.sh` | Is the server running? No token needed | 200 `{"ok":true}` |
| 02 | initialize (handshake) | `curl/02-initialize.sh` | The first message an AI app sends: who it is and which MCP version it speaks | 200, `result.serverInfo.name` = `job-hunt` |
| 03 | tools/list | `curl/03-tools-list.sh` | Every tool, with its description and input schema | 200, `result.tools` = `profile_get`, `profile_update`, `profile_import`, `profile_reset` |
| 04 | prompts/list | `curl/04-prompts-list.sh` | Every prompt (ready-made instruction) and its inputs | 200, `result.prompts` = `import_cv` |
| 05 | prompts/get import_cv | `curl/05-prompt-import-cv.sh` | The full instruction the AI gets when I pick `import_cv` | 200, `result.messages[0].content.text` = the instruction |
| 06 | profile_get | `curl/06-profile-get.sh` | Read the whole profile | 200, `result.structuredContent` = `{ profile, experiences, achievements, skills, ... }` |
| 07 | profile_update | `curl/07-profile-update.sh` | Save or change the main profile row | 200, the saved profile with `checked: false`, and the review link |
| 08 | profile_import | `curl/08-profile-import.sh` | First setup from a CV, in one call (all or nothing). Only on an **empty** profile | 200, counts per kind, `ref` → id, `not_checked` and `review_link`. On a full profile: `isError: true`, "The profile is not empty" |
| 09 | profile_reset (**DANGER**) | `curl/09-profile-reset.sh` | Deletes the whole profile and every item, checked or not. Can't be undone | 200, `deleted` = whether there was a profile row, and counts per kind |

A good order to try them: 01 → 02 → 03 → 09 (empty the test profile) → 08 → 06 → 07.

## 5. How to read an answer

Every `/mcp` request is a **POST** with one MCP message (JSON-RPC) in the body:

```json
{ "jsonrpc": "2.0", "id": 6, "method": "tools/call",
  "params": { "name": "profile_get", "arguments": { "only_checked": false } } }
```

It needs 3 headers:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`
- `Accept: application/json, text/event-stream` (both, or the server answers **406** "Not Acceptable")

The answer often comes as a small **stream** (Server-Sent Events), not plain JSON:

```
event: message
data: {"result":{"content":[...],"structuredContent":{...}},"jsonrpc":"2.0","id":6}
```

The JSON after `data:` is the real answer. Its `id` is the same as in the question.

## 6. When you add a tool or an address

Add its request here in the same change: one curl script in `curl/`, one request in the collection (same folder name, same body), and one row in the table above.
The server is stateless: each request stands alone, so a request never needs `initialize` first.
