# features/profile

My profile and all item kinds: experiences, achievements, skills (with proofs), projects, education, certificates, languages.

- **Profile card:** name, headline, contact, summary, links. Edit form.
- **One tab per item kind**, each with a table and Add / Edit / Delete (a skill proof has no Edit: delete it and add a new one).
- Each row shows a **checked** or **not checked** badge.
- `actions.ts`: `saveProfileAction`, `addItemAction`, `updateItemAction`, `deleteItemAction` (call the admin API).
- `components/`: `profile-info.tsx` (my info), `profile-items.tsx` (tabs, table, dialogs), `profile-skeleton.tsx`.

Rules:
- **Editing a checked item makes it not checked again** (the server does this). Show a small note before saving: "This item will need a new check."
- Delete asks "Are you sure?" first.
