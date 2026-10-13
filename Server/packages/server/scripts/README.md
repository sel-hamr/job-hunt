# scripts

Helper commands for developers. Examples:
- add test data to the database (seed)
- reset the database
- **show my profile**: `npm run show-profile` prints the whole profile as JSON, like `profile_get`. Add `-- --only-checked` for only the facts I have checked. Same database as the server.
- **reset my profile**: `npm run reset-profile` deletes the profile and every item, after you type `yes`. It uses the same database as the server (`DB_PATH` from `.env`, or the default file). Use it to try `profile_import` again.
- open MCP Inspector to try tools by hand
