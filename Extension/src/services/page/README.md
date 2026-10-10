# services/page

Gets the job text from the open tab.

- Finds the active tab.
- Runs the `extract` script in it with `chrome.scripting.executeScript` (needs the `activeTab` and `scripting` permissions).
- Returns: text, link, title, and the way it was read (selection / Readability / all text).
- Clear errors for pages Chrome doesn't allow, like `chrome://` pages and the Chrome Web Store.
