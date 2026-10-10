# features/profile

My profile and all item kinds: experiences, achievements, skills (with proofs), projects, education, certificates, languages.

- **Profile card:** name, headline, contact, summary, links. Edit form.
- **One tab per item kind**, each with a Data Table and Add / Edit / Delete.
- Each row shows a **checked** or **not checked** badge.
- `actions.ts`: add, update, delete (calls the admin API).

Rules:
- **Editing a checked item makes it not checked again** (the server does this). Show a small note before saving: "This item will need a new check."
- Delete asks "Are you sure?" first.
