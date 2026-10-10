# lib/session

Small helpers for the session cookie (`server-only`):

- **save:** after login. Cookie options: `httpOnly`, `sameSite: "lax"`, `path: "/"`, 7 days.
- **read:** for `lib/api/`.
- **delete:** on logout, or when the server says 401.

The cookie only **carries** the session. The **server** decides if it's valid.
