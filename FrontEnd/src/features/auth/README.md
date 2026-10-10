# features/auth

- `LoginForm`: email + password, one error message ("Wrong email or password"), a "wait 1 minute" message after too many tries.
- `actions.ts`: `login` (calls `POST /api/auth/login`, saves the session in an `httpOnly` cookie) and `logout` (calls `POST /api/auth/logout`, deletes the cookie).

Never log the password or the session.
