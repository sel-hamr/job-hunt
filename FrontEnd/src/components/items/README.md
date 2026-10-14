# components/items

Profile item pieces used by both **Profile** (add, edit) and **Review** (fix).

| File | What |
|---|---|
| `fields.ts` | The form fields of each kind (and of the profile row), in order. Turns the form text into the API input: on add, every filled field; on change, only the fields that changed (an emptied optional field is sent as `null`). |
| `item-form.tsx` | One form for every kind. It checks with the `@jobhunt/shared` schema first, then calls `onSubmit`. Problems show under their field, in plain English. |
| `item-dialog.tsx` | The form in a dialog. |
| `describe.ts` | Kind labels, and an item's name and detail line. |
| `check-chip.tsx` | The Checked / Not checked chip. |

Links between items ("Belongs to", "Proven by") are set when an item is added and never change (the API does not allow it), so the change form does not show them.
