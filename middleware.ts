import { auth } from "@/auth";

export default auth((req) => {
  // Redirect unauthenticated users trying to access protected routes
  if (!req.auth && (req.nextUrl.pathname.startsWith("/workouts") || req.nextUrl.pathname.startsWith("/food"))) {
    const newUrl = new URL("/auth/signin", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});

export const config = {
  matcher: ["/workouts", "/food"],
};
