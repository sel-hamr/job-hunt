# components (shared pieces)

Pieces used by more than one feature.

| Folder | What |
|---|---|
| `ui/` | shadcn/ui pieces (Button, Input, Table, Tabs, Dialog, Badge, Chart, ...). |
| `layout/` | The frame: rail, phone menu, top bar, sections, empty and error states. |
| `items/` | Profile item pieces used by both Profile and Review: the item form (every kind), its dialog, the Checked chip, item names. |

No saving here: a form gets an `onSubmit` from its feature, and the feature's Server Action calls the API.
