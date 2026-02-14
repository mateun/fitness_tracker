import Link from "next/link";
import Dashboard from "./components/Dashboard";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full">
        <Dashboard />
        <div className="flex justify-center mt-6">
          <div className="flex gap-3">
            <Link href="/workouts" className="rounded-full px-4 py-2 bg-foreground text-background">
              Workouts
            </Link>
            <Link href="/food" className="rounded-full px-4 py-2 border border-black/[.08] dark:border-white/[.12]">
              Food
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
