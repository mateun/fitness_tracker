# Database Setup Guide

## Overview
This app uses **PostgreSQL** with **Prisma ORM** for persistent data storage.

## Local Development Setup

### Prerequisites
- PostgreSQL 14+ installed locally or via Docker
- Node.js 18+

### Option A: PostgreSQL via Docker (Recommended for quick start)

1. **Start PostgreSQL in a container**

```bash
docker run --name fitness-tracker-db \
  -e POSTGRES_USER=ftuser \
  -e POSTGRES_PASSWORD=ftpass \
  -e POSTGRES_DB=fitness_tracker \
  -p 5432:5432 \
  -d postgres:16-alpine
```

2. **Update `.env.local`**

```env
DATABASE_URL=postgresql://ftuser:ftpass@localhost:5432/fitness_tracker
```

3. **Stop the container (when done)**

```bash
docker stop fitness-tracker-db
```

### Option B: PostgreSQL Native Install

1. **Install PostgreSQL** (macOS via Homebrew):

```bash
brew install postgresql@16
brew services start postgresql@16
```

2. **Create user and database**

```bash
psql postgres
CREATE USER ftuser WITH PASSWORD 'ftpass';
CREATE DATABASE fitness_tracker OWNER ftuser;
\q
```

3. **Update `.env.local`**

```env
DATABASE_URL=postgresql://ftuser:ftpass@localhost:5432/fitness_tracker
```

---

## Initialize Prisma & Run Migrations

### 1. Install dependencies

```bash
npm install
```

### 2. Create the initial migration

```bash
npx prisma migrate dev --name init
```

This will:
- Create the `User`, `Workout`, and `Food` tables in PostgreSQL.
- Generate the Prisma Client.

### 3. (Optional) Seed the database with test data

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Delete existing data (for development)
  await prisma.food.deleteMany();
  await prisma.workout.deleteMany();
  await prisma.user.deleteMany();

  // Create a test user
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      name: "Test User",
    },
  });

  // Create test workouts
  await prisma.workout.createMany({
    data: [
      { userId: user.id, date: "2026-02-14", title: "Run", duration: 30, notes: "Easy pace" },
      { userId: user.id, date: "2026-02-13", title: "Gym", duration: 60 },
      { userId: user.id, date: "2026-02-12", title: "Yoga", duration: 45 },
    ],
  });

  // Create test food entries
  await prisma.food.createMany({
    data: [
      { userId: user.id, date: "2026-02-14", name: "Oatmeal", calories: 150 },
      { userId: user.id, date: "2026-02-14", name: "Chicken", calories: 300 },
      { userId: user.id, date: "2026-02-13", name: "Apple", calories: 95 },
    ],
  });

  console.log("Seed data created!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Then run:

```bash
npx prisma db seed
```

---

## Useful Prisma Commands

```bash
# View the database schema in a UI
npx prisma studio

# Create a new migration
npx prisma migrate dev --name add_some_field

# Reset database (deletes all data, re-runs migrations)
npx prisma migrate reset

# Generate Prisma Client after manual schema edits
npx prisma generate

# Check/validate schema
npx prisma validate
```

---

## Next Steps

1. **API Routes**: Create routes in `app/api/workouts/route.ts` and `app/api/food/route.ts` to handle CRUD operations.
2. **React Components**: Update `app/workouts/page.tsx` and `app/food/page.tsx` to fetch from the API (instead of localStorage).
3. **Dashboard**: Update `app/components/Dashboard.tsx` to pull data from the database.

See `PRISMA_API_ROUTES.md` for examples.
