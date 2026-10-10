# services (the cooks)

The real job-hunt work happens here.
Example: "when status becomes 'applied', also save today's date".

Rules:
- No MCP code here. Services do not know about tools or doors.
- Services use `db/repositories` to read and write data.

Why: easy to test, and easy to reuse later (CLI, web page, ...).
