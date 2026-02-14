# Deployment Guide

## Overview
This guide covers containerizing the fitness-tracker app, adding a production database, and setting up SSL.

## Key decisions & tradeoffs

### SQLite vs PostgreSQL for multi-user
- **SQLite**: Simple file-based DB, no server needed, good for single-user or very low-concurrency apps.
  - ❌ Problematic for multiple concurrent users (file locking, write contention).
  - ❌ No built-in user/permission model.
- **PostgreSQL**: Full-featured relational DB, designed for multi-user, concurrent access.
  - ✅ Handles concurrent writes well.
  - ✅ Built-in authentication and row-level security.
  - ✅ Scalable and widely used in production.

**Recommendation**: Use **PostgreSQL** for any multi-user deployment.

---

## Step 1: Set up Prisma ORM and PostgreSQL

### Install Prisma
```bash
npm install @prisma/client
npm install -D prisma
npx prisma init
```

### Configure `.env.local`
```
DATABASE_URL="postgresql://ftuser:ftpass@localhost:5432/fitness_tracker"
```

### Create Prisma schema (`prisma/schema.prisma`)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // hash this with bcrypt
  createdAt DateTime @default(now())
  workouts  Workout[]
  foods     Food[]
}

model Workout {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date      String   // YYYY-MM-DD
  title     String
  duration  Int
  notes     String?
  createdAt DateTime @default(now())
}

model Food {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name      String
  calories  Int
  date      String   // YYYY-MM-DD
  createdAt DateTime @default(now())
}
```

### Run migrations
```bash
npx prisma migrate dev --name init
```

---

## Step 2: Build & push Docker image

### Build locally
```bash
docker build -t fitness-tracker:latest .
```

### Test with docker-compose (requires PostgreSQL running)
```bash
docker-compose up
```

### Push to registry (e.g., Docker Hub, ECR, Registery)
```bash
docker tag fitness-tracker:latest myregistry.azurecr.io/fitness-tracker:latest
docker push myregistry.azurecr.io/fitness-tracker:latest
```

---

## Step 3: Deploy on a server

### Option A: Self-hosted VPS (DigitalOcean, Linode, AWS EC2)

1. **SSH into your server**
   ```bash
   ssh root@your-server-ip
   ```

2. **Install Docker & Docker Compose**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Create deployment directory**
   ```bash
   mkdir -p /opt/fitness-tracker
   cd /opt/fitness-tracker
   ```

4. **Create production `docker-compose.yml`**
   ```yaml
   version: '3.9'
   services:
     app:
       image: myregistry.azurecr.io/fitness-tracker:latest
       ports:
         - "3000:3000"
       environment:
         DATABASE_URL: postgresql://ftuser:${DB_PASSWORD}@db:5432/fitness_tracker
         NODE_ENV: production
         NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}  # for session auth
       depends_on:
         db:
           condition: service_healthy
       restart: unless-stopped
       networks:
         - fitness_tracker
   
     db:
       image: postgres:16-alpine
       environment:
         POSTGRES_USER: ftuser
         POSTGRES_PASSWORD: ${DB_PASSWORD}
         POSTGRES_DB: fitness_tracker
       volumes:
         - postgres_data:/var/lib/postgresql/data
       healthcheck:
         test: ['CMD-SHELL', 'pg_isready -U ftuser']
         interval: 10s
         timeout: 5s
         retries: 5
       restart: unless-stopped
       networks:
         - fitness_tracker
   
   volumes:
     postgres_data:
   
   networks:
     fitness_tracker:
   ```

5. **Create `.env` file with secrets**
   ```bash
   echo "DB_PASSWORD=$(openssl rand -base64 32)" > .env
   echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env
   ```

6. **Start services**
   ```bash
   docker-compose up -d
   ```

7. **Check logs**
   ```bash
   docker-compose logs -f app
   ```

---

## Step 4: Set up SSL certificates with Let's Encrypt & Nginx reverse proxy

### Install Nginx
```bash
sudo apt-get update && sudo apt-get install -y nginx certbot python3-certbot-nginx
```

### Create Nginx config (`/etc/nginx/sites-available/fitness-tracker`)
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Enable site
```bash
sudo ln -s /etc/nginx/sites-available/fitness-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Get SSL certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot will automatically:
- Generate a certificate from Let's Encrypt
- Update your Nginx config to use HTTPS
- Set up auto-renewal (typically runs daily)

### Verify SSL renewal (optional)
```bash
sudo certbot renew --dry-run
```

---

## Step 5: Migrate from localStorage to API

Currently, the app uses `localStorage`. To use the server DB, you need to:

1. **Create API routes** (`app/api/workouts/route.ts`, `app/api/food/route.ts`) that:
   - Authenticate the user (via JWT or session).
   - Read/write from/to the Prisma DB.
   - Replace direct `localStorage` calls.

2. **Update React components** to fetch from the API instead of using `localStorage`.

3. **Add user authentication** (NextAuth.js is a good choice for Next.js).

Example API route:
```typescript
// app/api/workouts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';  // your auth setup
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const workouts = await prisma.workout.findMany({
    where: { user: { email: session.user.email } },
  });
  return NextResponse.json(workouts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, date, duration, notes } = await req.json();
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  
  const workout = await prisma.workout.create({
    data: { userId: user!.id, title, date, duration, notes },
  });
  return NextResponse.json(workout);
}
```

---

## Monitoring & Logs

```bash
# View app logs
docker-compose logs -f app

# View DB logs
docker-compose logs -f db

# SSH into running container
docker exec -it fitness-tracker_app_1 /bin/sh
```

---

## Scaling (future)

- **Load balancing**: Add a load balancer (HAProxy, AWS LB) in front of multiple app instances.
- **Database backups**: Use `pg_dump` or cloud provider backups.
- **CDN**: Serve static assets via CDN (Cloudflare, AWS CloudFront).
- **Caching**: Add Redis for session/data caching.

---

## Summary

| Item | Decision | Why |
|------|----------|-----|
| Database | PostgreSQL + Prisma | Multi-user, concurrent access |
| Containerization | Docker + docker-compose | Consistent dev/prod environments |
| Web server | Nginx reverse proxy | SSL termination, load balancing |
| SSL | Let's Encrypt + Certbot | Free, automatic renewal |
| Auth | NextAuth.js or similar | User isolation, sessions |

Next: let me know if you'd like me to implement the Prisma schema and API routes.
