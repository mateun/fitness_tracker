"use client";

import React, { useEffect, useState } from "react";

type Workout = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  duration: number; // minutes
  notes?: string;
};

const STORAGE_KEY = "workouts";

function loadWorkouts(): Workout[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Workout[]) : [];
  } catch {
    return [];
  }
}

function saveWorkouts(items: Workout[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [duration, setDuration] = useState<number | "">("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setWorkouts(loadWorkouts());
  }, []);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const w: Workout = {
      id: String(Date.now()),
      date,
      title: title.trim() || "Workout",
      duration: Number(duration) || 0,
      notes: notes.trim() || undefined,
    };
    const next = [...workouts, w];
    saveWorkouts(next);
    setWorkouts(next);
    setTitle("");
    setDuration("");
    setNotes("");
    setDate(new Date().toISOString().slice(0, 10));
  }

  // filter workouts from the last 7 days
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recent = workouts
    .filter((w) => new Date(w.date) >= cutoff)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
              <li key={w.id} className="rounded border p-3 bg-white dark:bg-[#0b0b0b]">
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium text-black dark:text-zinc-50">{w.title}</div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">{w.notes}</div>
                  </div>
                  <div className="text-right text-sm text-zinc-600 dark:text-zinc-400">
                    <div>{w.date}</div>
                    <div>{w.duration} min</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
