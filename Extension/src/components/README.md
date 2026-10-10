# components (the pieces)

Our own React parts of the screen. Examples (not created yet):

- `ModeTabs`: the 3 tabs (Selected, Full page, AI).
- `PromptPreview`: the editable text box with the prompt.
- `CopyButton`: copies and shows the "Copied" toast.
- `ShortTextWarning`: "This text is short. Did you click 'See more'?"
- `JobFieldsCard`: the fields the AI found (AI tab).

Rules:
- Components **show** things. They get data from hooks or props.
- They never call `services/` directly.
- Build them from the `ui/` pieces.
