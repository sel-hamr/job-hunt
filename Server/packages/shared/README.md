# shared (the common language)

Package name: **`@jobhunt/shared`**.

The **shapes of the data** (Zod schemas + TypeScript types) that more than one program needs:
- the **server** uses them to check admin API input and output,
- the **dashboard** (`Job Hunt/FrontEnd/`) uses them for forms and types.

If a shape changes here, TypeScript shows the error in both programs right away.

Rules:
- **Only shapes.** No logic, no database, no Node-only code, so it also runs in the browser.
- Only dependency: `zod`.
- The server's own `src/schemas/` can import from here, so nothing is written twice.
- The dashboard links to it with `"@jobhunt/shared": "file:../Server/packages/shared"` and lists it in `transpilePackages` (`next.config.ts`).
