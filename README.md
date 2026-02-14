Fitness Tracker
===============

A small Next.js (App Router) fitness-tracker prototype written in TypeScript. It stores all data in the browser (no backend) and provides pages for tracking workouts and food intake, plus a small dashboard summarizing the last 7 days.

Main features
-------------
- Home dashboard: shows highlights for the last 7 days (calories and workout minutes) with small charts.
- Workouts page: add a workout (title, date, duration, notes) and view workouts from the last 7 days.
- Food page: add food intakes (name, calories, date) and view entries grouped by date with per-day calorie totals.

Storage
-------
- All data is stored in `localStorage` under two keys:
	- `workouts` — array of { id, date: "YYYY-MM-DD", title, duration, notes? }
	- `foodIntake` — array of { id, name, calories, date: "YYYY-MM-DD" }

Technical notes
---------------
- Next.js 16 + React 19, TypeScript.
- Client components use `"use client"` and access `localStorage` inside `useEffect` to avoid SSR issues.
- Charts: `recharts` is used for the dashboard charts (a lightweight React-friendly charting library).
- Global navigation: `app/components/NavBar.tsx` is rendered in `app/layout.tsx`.

Important files
---------------
- `app/layout.tsx` — root layout (loads fonts, globals, and `NavBar`).
- `app/page.tsx` — home dashboard and links to the main pages.
- `app/components/Dashboard.tsx` — client dashboard that aggregates data and renders charts.
- `app/components/NavBar.tsx` — top navigation bar.
- `app/workouts/page.tsx` — workouts UI.
- `app/food/page.tsx` — food intake UI.
- `app/globals.css` — Tailwind import and theme variables.

Run locally
-----------
1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open http://localhost:3000

Notes
-----
- Dashboard and charts are client-only because they read `localStorage`. Keep client-side data access inside `useEffect` or client components.
- If you add server-side features later, consider migrating storage to a small API or database for persistence across devices.

Next steps (ideas)
------------------
- Add edit/delete actions for workouts and food entries.
- Add CSV export/import or a backend sync option.
- Improve responsive styling for the `NavBar` and dashboard tiles.

Contact / Contribution
----------------------
This is a small demo project — modify freely. If you want help adding features, tell me what you'd like next.

