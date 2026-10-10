# config (the settings)

Reads settings one time at start, and checks they are correct:
- which door: `stdio` or `http`
- port and host for HTTP (host is `127.0.0.1` by default, for safety)
- auth token (password) for HTTP
- database file path (`DB_PATH`)

If a setting is wrong, the server stops with a clear message.
