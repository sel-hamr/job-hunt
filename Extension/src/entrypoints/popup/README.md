# popup

The window that opens when I click the extension icon.

Files (not created yet):

| File | Easy meaning |
|---|---|
| `index.html` | The page. WXT finds it here. |
| `main.tsx` | Starts React. |
| `App.tsx` | The screen: 3 tabs (**Selected**, **Full page**, **AI**), the editable preview, the **Copy** button, the "Copied" toast and the short-text warning. |

Rule: keep this thin. It shows things and uses hooks. The logic lives in `core/` and `services/`.
