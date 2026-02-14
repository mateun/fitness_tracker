
# fitness-tracker — LLM summary

Short description
- Minimal Next.js (App Router) fitness tracker prototype (TypeScript).
- Tracks workouts and food intake in-browser using `localStorage` and provides a small dashboard.

Primary routes
- `/` — Home dashboard: simplified landing that shows a 7-day highlights dashboard (calories & workouts) and CTAs to `/workouts` and `/food`.
- `/workouts` — Client page to add workouts and view workouts from the last 7 days.
- `/food` — Client page to add food intakes, grouped by date with per-day calorie totals.

Storage
- All data is local only (no backend) and stored in `localStorage`.
- Keys and shapes:
  - `workouts`: array of objects { id: string, date: "YYYY-MM-DD", title: string, duration: number, notes?: string }
  - `foodIntake`: array of objects { id: string, name: string, calories: number, date: "YYYY-MM-DD" }

Important files & components
- `app/layout.tsx` — root layout, loads fonts and `globals.css`, now includes the global `NavBar`.
- `app/page.tsx` — home dashboard; now renders `app/components/Dashboard.tsx` (client) and CTAs to `Workouts`/`Food`.
- `app/components/Dashboard.tsx` — client component that reads `localStorage` and renders charts for the last 7 days.
- `app/components/NavBar.tsx` — client navigation bar included in the root layout.
- `app/workouts/page.tsx` — client UI for adding/listing workouts (localStorage).
- `app/food/page.tsx` — client UI for adding food intakes and showing daily summaries.
- `app/globals.css` — Tailwind import and theme CSS variables.
- `package.json`, `next.config.ts`, `tsconfig.json` — project config. `package.json` now includes `recharts`.

Dev notes for LLMs
- To run locally: first install deps then start the dev server:
  ```bash
  npm install
  npm run dev
  ```
- The app uses Next 16 + React 19. Client components have `"use client"` at the top.
- `Dashboard` and `NavBar` are client components. `Dashboard` reads `localStorage` on mount — it must not be server-rendered.
- Charts use `recharts` (added to `package.json`) — a lightweight, React-friendly charting library suitable for simple dashboards.

Charting library
- Current: `recharts` — declarative, easy to integrate with React components, good for small dashboards and prototypes.
- Alternatives: `react-chartjs-2` (Chart.js) for more polished visuals, `nivo` or `visx` for more customization.

Notes & troubleshooting
- If you see SSR-related errors about `ssr:false`, the fix is to keep charting/dashboard components strictly client-side (either via dynamic import in a client component or direct import into a client component). This project imports `Dashboard` as a client component.
- Dates are stored as `YYYY-MM-DD` strings — grouping and filtering is done by string/date conversions in the components.

Suggested next improvements
- Add edit/delete for entries on `/workouts` and `/food`.
- Add CSV export/import or simple backend sync for persistence across devices.
- Improve NavBar for responsive/mobile layout.

Quick pointers for modifying code
- Use `app/components/Dashboard.tsx` as the example for aggregating `localStorage` data into series for charts.
- Keep `localStorage` access inside `useEffect` in client components to avoid SSR issues.

