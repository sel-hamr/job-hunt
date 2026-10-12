# Finding jobs with Claude in Chrome (planned)

Status: **not built yet.** It comes last in step 2, after `job_add`, `job_list`, `requirements_set` and `match_save`.
The rules live in `../PRODUCT.md` ("Job search") and `../TOOLS.md` (the `find_jobs` row). This note explains how the parts fit together.

## The big picture

Claude Desktop can use **many MCP servers in the same chat**. For job search we use two:

| Server | What it gives | Its job |
|---|---|---|
| **Claude in Chrome** | browser tools: open a page, click, read text | **find** the jobs (LinkedIn, ...) |
| **job-hunt** (ours) | `job_add`, `requirements_set`, `match_save`, ... | **save** the jobs and the match |

```
You ⇄ Claude Desktop ⇄ Claude in Chrome ⇄ your Chrome (your LinkedIn login)
                    ⇄ job-hunt server  ⇄ database
```

Claude is the one in the middle. It reads a job with the browser, then gives the text to our server.
**Our server never opens a web page.** For the server, a job from `find_jobs` looks the same as a job I pasted.

## Why a prompt, and not a tool

A tool can't use the browser: the browser tools belong to Claude in Chrome, not to us.
A **prompt** is just ready instructions. I pick `find_jobs` from the **+** menu, fill in a few boxes, and Claude gets the whole plan:
which tools to use, in which order, and what it must never do.

A prompt only **asks**. It can't force Claude to follow it. So the important rules also live in the tools, where the server checks them:

| Rule | Where the server checks it |
|---|---|
| The same job is not saved twice | `job_add` refuses a `link` that is already saved |
| Each requirement quotes the job text | `requirements_set` (quote check) |
| A match uses only checked facts | `match_save` (proof check) |

## One run, step by step

Example: `query` = "React Node full-stack, posted this week", `location` = "remote", `max_jobs` = 5.

1. `profile_get` (checked only). Nothing checked → stop: "run `import_cv` and review your profile first".
2. `job_list`, to know what is already saved.
3. In Chrome: open LinkedIn Jobs, search, set the filters.
4. For each result: open it, click **"See more"**, read the **full** text.
5. Clearly not a fit (`avoid` list, wrong level, wrong place)? → **not saved**, only noted with the reason.
6. A fit → `job_add` (the full text unchanged + the clean link) → `requirements_set` → `match_save`.
7. Stop after 5 saved jobs, or after reading about 15.
8. Reply: saved jobs best fit first, then the jobs not saved and why, then the duplicates.

## Why these choices

- **Not saving bad fits:** the database stays clean, and the chat keeps room for the good jobs.
- **5 jobs by default:** each job means the full text + requirements + match. That is a lot of text in one chat.
- **The clean link** (`https://www.linkedin.com/jobs/view/<id>/`, no `?...` part): the duplicate check compares the exact text, so the same job must always give the same link.
  The server doesn't cut the `?` part itself, because on some sites the job id **is** in it (Indeed: `viewjob?jk=...`).
- **Read only:** no Apply, no Message, no Connect. Auto-apply stays "not planned".
- **Stop at a captcha or security check:** never try to get around it. LinkedIn can block accounts that look like bots, so the search stays small and slow.

## Setup in Claude Desktop

1. Install **Claude in Chrome** from the Chrome Web Store and sign in with the same Claude account.
2. In Claude Desktop: **Settings → Connectors** → turn on Claude in Chrome.
3. Add our server: **Settings → Developer → Edit Config**:

```json
{
  "mcpServers": {
    "job-hunt": {
      "command": "node",
      "args": ["C:\\Users\\sel-hamr\\projects\\job-hunt\\Server\\packages\\server\\src\\index.ts"],
      "env": {
        "DB_PATH": "C:\\Users\\sel-hamr\\projects\\job-hunt\\Server\\packages\\server\\data\\jobs.sqlite",
        "DASHBOARD_URL": "http://localhost:3000"
      }
    }
  }
}
```

4. Restart Claude Desktop. Log in to LinkedIn in Chrome.

**Use a full `DB_PATH`.** A short path like `./data/jobs.sqlite` starts from the folder where the server was started.
Claude Desktop starts it from another folder, so it would make a **second, empty** database without any error.
(`TRANSPORT` is not set, so the server uses stdio, which is what Claude Desktop needs.)
