# Database Schema Design

## Overview
The schema uses **PostgreSQL** with **Prisma ORM** for multi-user fitness tracking.

## Key Design Decisions

### Models

1. **User**
   - `id`: unique identifier (CUID) — primary key
   - `email`: unique, from Google OAuth
   - `name`: optional, from Google profile
   - `image`: optional, Google profile picture
   - `createdAt`: timestamp when account was created
   - Relations: one-to-many with Workout and Food

2. **Workout**
   - `id`: unique identifier (CUID)
   - `userId`: foreign key to User (cascade delete)
   - `date`: string `YYYY-MM-DD` for easy grouping/filtering
   - `title`: e.g., "Run", "Push day"
   - `duration`: minutes (integer, non-negative)
   - `notes`: optional details
   - `createdAt`: server timestamp
   - Indexes: `userId`, `date` for fast queries

3. **Food**
   - `id`: unique identifier (CUID)
   - `userId`: foreign key to User (cascade delete)
   - `date`: string `YYYY-MM-DD` for grouping
   - `name`: e.g., "Apple", "Chicken breast"
   - `calories`: integer (non-negative)
   - `createdAt`: server timestamp
   - Indexes: `userId`, `date` for fast queries

### Why These Choices?

- **onDelete: Cascade**: If a user is deleted, all their workouts/food are removed automatically.
- **Date as string**: Easier grouping by date in queries (no timezone issues), matches frontend format.
- **Indexes on userId + date**: Enables efficient queries like "get all workouts for user X between date Y and Z".
- **CUID IDs**: URLs-friendly unique IDs (better than UUIDs for some use cases).

## Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    String @id @default(cuid())
  email String @unique
  name  String?
  image String?

  workouts Workout[]
  foods    Food[]

  createdAt DateTime @default(now())
}

model Workout {
  id       String @id @default(cuid())
  userId   String
  user     User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  date     String
  title    String
  duration Int
  notes    String?

  createdAt DateTime @default(now())

  @@index([userId])
  @@index([date])
  @@index([userId, date])
}

model Food {
  id       String @id @default(cuid())
  userId   String
  user     User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  date     String
  name     String
  calories Int

  createdAt DateTime @default(now())

  @@index([userId])
  @@index([date])
  @@index([userId, date])
}
```

## Sample Queries

```typescript
// Get user's workouts for last 7 days
const workouts = await prisma.workout.findMany({
  where: {
    userId: user.id,
    date: { gte: "2026-02-07", lte: "2026-02-14" },
  },
  orderBy: { date: "desc" },
});

// Get user's food for a specific date with calorie total
const foods = await prisma.food.findMany({
  where: {
    userId: user.id,
    date: "2026-02-14",
  },
});
const totalCals = foods.reduce((sum, f) => sum + f.calories, 0);

// Delete a workout
await prisma.workout.delete({
  where: { id: workoutId },
});

// Get dashboard data (7-day summary)
const workoutsByDate = await prisma.workout.groupBy({
  by: ["date"],
  where: { userId: user.id, date: { gte: sevenDaysAgo } },
  _sum: { duration: true },
});

const foodByDate = await prisma.food.groupBy({
  by: ["date"],
  where: { userId: user.id, date: { gte: sevenDaysAgo } },
  _sum: { calories: true },
});
```

## Next Steps

1. Install Prisma: `npm install @prisma/client`
2. Create `prisma/schema.prisma` with the schema above
3. Run `npx prisma migrate dev --name init`
4. Create API routes to replace localStorage calls
5. Wire up React components to fetch from API instead of localStorage
