"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="flex flex-col items-center gap-6 bg-white dark:bg-[#0b0b0b] p-8 rounded-lg border max-w-md">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Sign In</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-center">Sign in with Google to track your workouts and food</p>
        <button
          onClick={() => signIn("google", { redirectTo: "/" })}
          className="rounded-full bg-foreground px-6 py-3 text-background font-medium hover:opacity-90"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
