---
name: git-workflow
description: Use when making a commit, naming or creating a branch, or opening, writing or merging a pull request (PR / MR) in the job-hunt repo.
---

# Git workflow (job-hunt)

One standard for commits, branches and pull requests, in every part of this repo. Explain git steps to the user in simple English.

## Types

| Type | Use for |
|---|---|
| `feat` | New behaviour the user can see or use (a tool, a page, a table) |
| `fix` | A bug fix |
| `refactor` | Code change, same behaviour |
| `perf` | Faster, same behaviour |
| `docs` | Only docs: `README.md`, `AGENTS.md`, `docs/` |
| `chore` | Setup, dependencies, config, scripts |

## Scopes

The scope is the part of the repo that changed:

| Scope | Folder |
|---|---|
| `server` | `Server/packages/server/`, plus `Server/` root files and `Server/docs/` |
| `shared` | `Server/packages/shared/` |
| `agent` | `Server/packages/agent/` |
| `dashboard` | `FrontEnd/` |
| `extension` | `Extension/` |
| `repo` | Root files: `README.md`, `package.json`, `scripts/`, `.claude/` |

A change in two scopes becomes one commit per scope. When one change truly spans two (a shared shape and the server tool that uses it), use the scope where the main change lives.

## Commits

Format: `type(scope): text`

- Text: present tense verb first (`add`, `fix`, `remove`), lowercase start, no period. Whole line 72 characters or less.
- Body (optional, after one empty line): short bullets on what changed and why.
- Breaking change (a tool input, an `/api` address, a shared shape, or a migration that changes data): add `!` before the colon and a body line `BREAKING CHANGE: <what breaks>`.
- One commit holds one logical change.

```
feat(server): add profile repository
fix(dashboard): show an error when a save fails
chore(server): set up npm workspaces and TypeScript
docs(server): explain how migrations run
feat(shared)!: rename experience.title to position
```

## Branches

Format: `type/scope/short-name`

- Lowercase, words joined with `-`, short name 2 to 5 words.
- Start every branch from an up-to-date `main`:

  ```bash
  git switch main
  git pull
  git switch -c feat/server/profile-repository
  ```

- One branch holds one topic and becomes one PR. `main` changes only through a merged PR.

## Pull requests

1. **Check.** Run the check commands listed in the changed part's `AGENTS.md` (for example `typecheck`), and update every source-of-truth doc the change touches (`DATABASE.md`, `TOOLS.md`, `API.md`, `SHARED.md`).
2. **Ask the user** before pushing or opening the PR: both are visible on GitHub.
3. **Push and open:**

   ```bash
   git push -u origin <branch>
   gh pr create --base main --title "<type(scope): text>" --body-file <file>
   ```

   The title uses the commit format, because it becomes the one squash commit on `main`.

4. **Body**, in this shape:

   ```markdown
   ## What
   - <each change, one line>

   ## Why
   <the reason, 1-3 lines>

   ## How to check
   - [ ] <command or manual step>

   ## Docs updated
   - [ ] <doc file>, or "None needed"
   ```

5. **Merge** with squash only, then clean up:

   ```bash
   gh pr merge <number> --squash --delete-branch
   git switch main
   git pull
   ```

The PR is done when it is merged, its branch is deleted on GitHub and locally, and local `main` is pulled.
