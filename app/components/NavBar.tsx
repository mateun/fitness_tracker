"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import React from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/workouts", label: "Workouts" },
  { href: "/food", label: "Food" },
];

export default function NavBar() {
  const pathname = usePathname() || "/";
  const { data: session } = useSession();

  return (
    <nav className="w-full border-b border-black/[.06] dark:border-white/[.06] bg-background">
      <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-4 py-2 transition-colors ${
                  active
                    ? "bg-foreground text-background"
                    : "text-zinc-700 hover:bg-black/[.04] dark:text-zinc-300"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <span className="text-sm text-zinc-700 dark:text-zinc-300">{session.user.name}</span>
              <button
                onClick={() => signOut()}
                className="rounded-full px-4 py-2 text-sm text-zinc-700 hover:bg-black/[.04] dark:text-zinc-300"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="rounded-full px-4 py-2 text-sm text-zinc-700 hover:bg-black/[.04] dark:text-zinc-300"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
