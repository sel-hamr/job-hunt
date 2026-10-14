# lib (the tools)

| Folder / file | Job |
|---|---|
| `api/` | The **only** code that calls the server's admin API. |
| `action-result.ts` | `ActionResult`: what every Server Action answers (`ok`, or `error` + `problems`). Plain data, used in the browser too. |

The `cn()` helper comes from the `cn` package.
