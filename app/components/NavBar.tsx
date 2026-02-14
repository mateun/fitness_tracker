"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/workouts", label: "Workouts" },
  { href: "/food", label: "Food" },
];

export default function NavBar() {
  const pathname = usePathname() || "/";

  return (
    <nav className="w-full border-b border-black/[.06] dark:border-white/[.06] bg-background">
      <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-4">
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
    </nav>
  );
}
