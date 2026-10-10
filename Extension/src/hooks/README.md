# hooks (the glue)

React hooks that connect the screen to the services. Examples (not created yet):

| Hook | Job |
|---|---|
| `useExtract` | Asks `services/page/` for the job text, and keeps "loading" and "error" states. |
| `useAiFields` | Asks `services/claude/` for the job fields. |
| `useApiKey` | Reads and saves the key with `services/storage/`. |

Rule: hooks hold **screen state** (loading, error, result). The real work is in `services/` and `core/`.
