# extract (the page reader)

A small script that the popup puts into the open tab **only when I click** (`chrome.scripting.executeScript`).
In WXT this is an "unlisted script" (`defineUnlistedScript`), so it never runs on its own.

What it does:
1. If I selected text, return that.
2. If not, run **Mozilla Readability** and return the main content.
3. If Readability finds nothing, return all the page text.

It also returns the page **link** and **title**, and which of the 3 ways was used.

Rules:
- **Only read.** Never change the page. (Readability changes the document it reads, so give it a **copy** of the page: `document.cloneNode(true)`.)
- **Never rewrite words.** Readability only cuts parts away.
- This is the **only** code that touches the job page.
