# hooks

Small React hooks used in browser components.

- `use-mobile.ts`: "is the screen small?" Added by shadcn/ui for the Sidebar piece (not used by the app shell now). Changed once to use `useSyncExternalStore`, so lint passes.

Rule: hooks here never call the server. Data comes from Server Components and Server Actions (`features/`).
