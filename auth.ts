import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const googleId = process.env.GOOGLE_ID;
const googleSecret = process.env.GOOGLE_SECRET;

if (!googleId || !googleSecret) {
  console.warn(
    "⚠️  Missing GOOGLE_ID or GOOGLE_SECRET environment variables. Add them to .env.local to enable Google OAuth."
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: googleId && googleSecret ? [
    GoogleProvider({
      clientId: googleId,
      clientSecret: googleSecret,
    }),
  ] : [],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    authorized: async ({ auth }) => {
      // For now, just check if user exists
      return !!auth?.user;
    },
  },
});
