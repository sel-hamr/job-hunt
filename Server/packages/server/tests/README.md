# tests

| Folder | What it tests |
|---|---|
| `unit/` | Services and repositories alone. Uses a database in memory (`:memory:`). Fast. |
| `integration/` | The real server, called like a real app would call it, through **stdio** and through **HTTP**. Finds bugs that happen in only one door. |
