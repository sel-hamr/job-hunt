# features/home

The Home page. Read-only.

- **Stat cards:** jobs saved, items waiting for my check (links to `/review`).
- **Fit label chart:** how many jobs are Good fit / Some gaps / Big gaps.
- **Top 5 missing skills:** from the gap report.

All numbers come from the server (`GET /api/stats`). The dashboard never counts by itself. Until jobs exist (build step 2), the chart and the skills table show an empty note.

Files: `components/home-screen.tsx`, `components/fit-chart.tsx` (Recharts, browser only), `components/home-skeleton.tsx`.
