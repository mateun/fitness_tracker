"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Workout = {
  id: string;
  date: string;
  title: string;
  duration: number;
  notes?: string;
};

export default function WorkoutsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [duration, setDuration] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Fetch workouts on mount
  useEffect(() => {
    if (status === "authenticated") {
      fetchWorkouts();
    }
  }, [status]);

  async function fetchWorkouts() {
    try {
      setLoading(true);
      const res = await fetch("/api/workouts");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setWorkouts(data);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          title: title.trim() || "Workout",
          duration: Number(duration) || 0,
          notes: notes.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to create workout");
      
      const newWorkout = await res.json();
      setWorkouts([newWorkout, ...workouts]);
      setTitle("");
      setDuration("");
      setNotes("");
      setDate(new Date().toISOString().slice(0, 10));
    } catch (error) {
      console.error("Error creating workout:", error);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/workouts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setWorkouts(workouts.filter((w) => w.id !== id));
    } catch (error) {
      console.error("Error deleting workout:", error);
    }
  }

  // Filter workouts from last 7 days
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recent = workouts
    .filter((w) => new Date(w.date) >= cutoff)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (status === "loading" || loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0b0b0b] rounded-lg p-6 shadow">
        <h2 className="text-2xl font-semibold mb-4 text-black dark:text-zinc-50">Add Workout</h2>
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              aria-label="Title"
              placeholder="Title (e.g., Run, Push day)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 rounded border px-3 py-2"
            />
            <input
              aria-label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded border px-3 py-2"
            />
          </div>

          <div className="flex gap-2">
            <input
              aria-label="Duration"
              type="number"
              min={0}
              placeholder="Duration (min)"
              value={duration as any}
              onChange={(e) => setDuration(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-40 rounded border px-3 py-2"
            />
            <input
              aria-label="Notes"
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex-1 rounded border px-3 py-2"
            />
          </div>

          <div className="flex justify-end">
            <button className="rounded-full bg-foreground px-4 py-2 text-background font-medium">Add</button>
          </div>
        </form>
      </div>

      <div className="w-full max-w-2xl mt-6">
        <h3 className="text-xl font-semibold mb-2 text-black dark:text-zinc-50">Workouts (last 7 days)</h3>
        {recent.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">No workouts in the last 7 days.</p>
        ) : (
          <ul className="space-y-3">
            {recent.map((w) => (
              <li key={w.id} className="rounded border p-3 bg-white dark:bg-[#0b0b0b] flex justify-between items-start">
                <div>
                  <div className="font-medium text-black dark:text-zinc-50">{w.title}</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">{w.notes}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-right text-sm text-zinc-600 dark:text-zinc-400">
                    <div>{w.date}</div>
                    <div>{w.duration} min</div>
                  </div>
                  <button
                    onClick={() => handleDelete(w.id)}
                    className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
