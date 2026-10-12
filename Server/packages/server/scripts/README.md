# scripts

Helper commands for developers. Examples:
- add test data to the database (seed)
- reset the database
- **show my profile**: `npm run show-profile` prints the whole profile as JSON, like `profile_get`. Add `-- --only-checked` for only the facts I have checked. Same database as the server.
- **reset my profile**: `npm run reset-profile` deletes the profile and every item, after you type `yes`. It uses the same database as the server (`DB_PATH` from `.env`, or the default file). Use it to try `profile_import` again.
- open MCP Inspector to try tools by hand
- **create my user** for the dashboard: asks for email and password in the terminal (password hidden), saves the scrypt hash. Run again to change the password (this also deletes all sessions). This is the only way to make a user: there is no sign-up page.
