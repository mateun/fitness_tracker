
# fitness-tracker — LLM summary

Short description
- Full-stack Next.js (App Router) fitness tracker with TypeScript, Prisma ORM, and PostgreSQL backend.
- Tracks workouts and food intake with multi-user support via Google OAuth authentication.
- Provides a 7-day dashboard with charts for calories and workout minutes.

Primary routes
- `/` — Home dashboard: simplified landing showing a 7-day highlights dashboard (calories & workouts) and CTAs to `/workouts` and `/food`. Requires authentication.
- `/workouts` — Protected client page to add workouts and view entries from database. Supports deletion.
- `/food` — Protected client page to add food intakes, grouped by date with per-day calorie totals. Supports deletion.
- `/auth/signin` — Google OAuth sign-in page (public, shown when unauthenticated).

Authentication
- NextAuth.js v5 with Google OAuth provider.
- Middleware (`middleware.ts`) protects `/workouts` and `/food` routes (redirects unauthenticated users to `/auth/signin`).
- Session provider wraps the entire app (`app/components/SessionProvider.tsx`).
- `NavBar` component shows user name when authenticated, sign-out button available.

Storage & Database
- PostgreSQL database (via `docker-compose.yml`).
- Prisma ORM with schema in `prisma/schema.prisma`:
  - `User` — id, email (unique), name, image, createdAt
  - `Workout` — id, userId (FK), date, title, duration, notes, createdAt; indexed on (userId, date)
  - `Food` — id, userId (FK), date, name, calories, createdAt; indexed on (userId, date)
- Singleton Prisma client: `lib/prisma.ts`.

API Routes
- `POST /api/auth/[...nextauth]` — NextAuth handler for Google OAuth flow.
- `GET /api/workouts` — fetch authenticated user's workouts; `POST /api/workouts` — create new workout.
- `DELETE /api/workouts/[id]` — delete workout by ID (ownership verified).
- `GET /api/food` — fetch authenticated user's food entries; `POST /api/food` — create new entry.
- `DELETE /api/food/[id]` — delete food entry by ID (ownership verified).
- All routes require authentication; `POST`/`DELETE` verify user ownership.

Important files & components
- `app/layout.tsx` — root layout with `SessionProvider` wrapper and global `NavBar`.
- `app/page.tsx` — home page; renders `Dashboard` component with CTAs.
- `app/components/Dashboard.tsx` — client component; fetches from `/api/food` and `/api/workouts`, renders two Recharts charts (calories stacked bar with 2000 kcal threshold, workouts line).
- `app/components/NavBar.tsx` — global navigation with active route highlighting, user name display, and sign-out button (requires `useSession`).
- `app/components/SessionProvider.tsx` — NextAuth session wrapper.
- `app/workouts/page.tsx` — client page; fetches `/api/workouts`, adds/deletes via API calls, requires authentication.
- `app/food/page.tsx` — client page; fetches `/api/food`, adds/deletes via API calls, requires authentication.
- `auth.ts` — NextAuth configuration (Google provider, session callbacks).
- `middleware.ts` — route protection for `/workouts` and `/food`.
- `app/auth/signin/page.tsx` — Google OAuth sign-in UI.
- `app/globals.css` — Tailwind & CSS variables.
- `package.json` — includes `next-auth`, `@prisma/client`, `recharts`, and dev dependency `prisma`.

Dev notes for LLMs
- To run locally:
  ```bash
  npm install
  docker-compose up -d              # Start PostgreSQL
  npx prisma migrate dev --name init # Initialize schema
  npm run dev
  ```
- Then create `.env.local` with `GOOGLE_ID`, `GOOGLE_SECRET`, `NEXTAUTH_SECRET`, and `DATABASE_URL`.
- The app uses Next 16 + React 19. Client components have `"use client"` at the top.
- All data fetches use `useSession()` for auth state; pages redirect unauthenticated users via `middleware.ts`.
- Charts use `recharts` — renders calories stacked bar (limegreen up to 2000 kcal, red for overflow) and workouts line on a 7-day moving window.

Charting & visualization
- Library: `recharts` — used by `Dashboard.tsx` for the home dashboard.
- Calories chart: stacked bar per day with two series:
  - `caloriesBase`: capped at 2000 kcal (limegreen `#32CD32`).
  - `caloriesOver`: amount above 2000 kcal (red `#ef4444`).
- Workouts chart: line chart showing total minutes per day.
- Both charts show last 7 days; computed client-side from fetched API data.

Database setup
- PostgreSQL 16 via Docker (`docker-compose.yml`).
- Schema migrations: `npx prisma migrate dev --name init` creates User, Workout, Food tables.
- Seed data can be added via `prisma/seed.ts` (optional).
- For production: use external PostgreSQL (e.g., AWS RDS, Railway, Render) and set `DATABASE_URL` environment variable.

Notes & troubleshooting
- Authentication is required for `/workouts` and `/food`; unauthenticated users redirected to `/auth/signin` by middleware.
- Google OAuth credentials must be in `.env.local` at runtime (see `AUTH_SETUP.md` for setup steps).
- All API routes verify user ownership before operations (e.g., can only delete own workouts).
- Dates stored as `YYYY-MM-DD` strings in database; 7-day window computed on client side.
- Dashboard requires authentication; shows "Please sign in" if not authenticated.

Suggested next improvements
- Edit endpoint for workouts/food (currently add/delete only).
- Search or filter by date range.
- Export data to CSV.
- Configurable calorie threshold (currently hardcoded 2000 kcal).
- Mobile-responsive improvements.

Quick pointers for modifying code
- To add a new field to Workout/Food: update `prisma/schema.prisma`, run `npx prisma migrate dev`, and update API route handlers & UI component.
- To create a new API endpoint: add file to `app/api/`, use `auth()` from `auth.ts` to check authentication, and query Prisma ORM.
- To protect a new route: add to the matcher in `middleware.ts`.

