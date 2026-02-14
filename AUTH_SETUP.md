# Authentication Setup with Google OAuth

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/);
2. Create a new project (e.g., "fitness-tracker").
3. Navigate to **APIs & Services** > **Credentials**.
4. Click **Create Credentials** > **OAuth 2.0 Client ID**.
5. Choose **Web Application**.
6. Add authorized redirect URIs:
   - Local dev: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
7. Copy the **Client ID** and **Client Secret**.

## Step 2: Set up Environment Variables

Create a `.env.local` file in the project root:

```env
GOOGLE_ID=your_client_id_here
GOOGLE_SECRET=your_client_secret_here
NEXTAUTH_SECRET=your_random_secret_here
```

**Generate a secure `NEXTAUTH_SECRET`:**
```bash
openssl rand -base64 32
```

Or on Windows (PowerShell):
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Maximum 256) })) 
```

## Step 3: Install Dependencies

```bash
npm install
```

This installs `next-auth` and other required packages.

## Step 4: Run the App

```bash
npm run dev
```

Visit `http://localhost:3000`:
- Click **Sign in** in the top-right.
- You'll be redirected to Google OAuth.
- After signing in, you'll be logged in and can access `/workouts` and `/food`.

## How It Works

- **NextAuth.js** handles Google OAuth authentication.
- **SessionProvider** (in `app/components/SessionProvider.tsx`) wraps the app to provide session context.
- **NavBar** shows login/logout buttons and the user's name when authenticated.
- **Protected pages** (optional): you can add middleware to require authentication on `/workouts` and `/food`.

## Optional: Protect Routes with Middleware

Create `middleware.ts` in the root:

```typescript
import { auth } from "@/auth";

export default auth((req) => {
  // Check if user is authenticated for /workouts and /food
  if (!req.auth && (req.nextUrl.pathname.startsWith("/workouts") || req.nextUrl.pathname.startsWith("/food"))) {
    const newUrl = new URL("/auth/signin", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});

export const config = {
  matcher: ["/workouts", "/food", "/api/(.*)"],
};
```

This redirects unauthenticated users to the sign-in page when they try to access protected routes.

## Troubleshooting

- **"Missing GOOGLE_ID or GOOGLE_SECRET"**: Check your `.env.local` file has the correct keys.
- **Redirect URI mismatch**: Ensure the registered URI in Google Cloud Console matches your app's URL exactly.
- **Session not loading**: Clear DevTools local storage and cookies, then reload.

## Next Steps

- Add **middleware** to protect `/workouts` and `/food` routes (see optional section above).
- Integrate **Prisma + PostgreSQL** to save user data to a database instead of localStorage.
- Add **user-specific data** queries that filter workouts/food by the authenticated user.
