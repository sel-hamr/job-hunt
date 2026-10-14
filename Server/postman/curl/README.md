# curl (one script per request)

Each `NN-name.sh` sends one request to the server and prints the answer, then `HTTP <status>`.
The list, what each one does, and the expected answers: `../README.md`, part 4.
The same requests are in the Postman collection (`../job-hunt.postman_collection.json`).

`_settings.sh` is loaded by every script. It sets:
- `BASE_URL`: default `http://127.0.0.1:3001`.
- `MCP_TOKEN`: if not set, read from `AUTH_TOKEN` in `packages/server/.env`. Scripts that call `/mcp` stop with a clear message when there is no token. The `/api` scripts (10-18) need no token.

Run from `Server/` (Git Bash on Windows):

```
bash postman/curl/03-tools-list.sh
MCP_TOKEN=abc... bash postman/curl/06-profile-get.sh
```

`09-profile-reset.sh` deletes the whole profile: use a test database.
