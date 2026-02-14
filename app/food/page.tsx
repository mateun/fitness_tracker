"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Food = {
  id: string;
  name: string;
  calories: number;
  date: string;
};

export default function FoodPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [foods, setFoods] = useState<Food[]>([]);
  const [name, setName] = useState("");
  const [calories, setCalories] = useState<number | "">("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Fetch foods on mount
  useEffect(() => {
    if (status === "authenticated") {
      fetchFoods();
    }
  }, [status]);

  async function fetchFoods() {
    try {
      setLoading(true);
      const res = await fetch("/api/food");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setFoods(data);
    } catch (error) {
      console.error("Error fetching foods:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          name: name.trim() || "Food",
          calories: Number(calories) || 0,
        }),
      });
      if (!res.ok) throw new Error("Failed to create food entry");
      
      const newFood = await res.json();
      setFoods([newFood, ...foods]);
      setName("");
      setCalories("");
      setDate(new Date().toISOString().slice(0, 10));
    } catch (error) {
      console.error("Error creating food entry:", error);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/food/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setFoods(foods.filter((f) => f.id !== id));
    } catch (error) {
      console.error("Error deleting food entry:", error);
    }
  }

  // group foods by date
  const grouped = foods.reduce<Record<string, Food[]>>((acc, cur) => {
    (acc[cur.date] ||= []).push(cur);
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1));

  if (status === "loading" || loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0b0b0b] rounded-lg p-6 shadow">
        <h2 className="text-2xl font-semibold mb-4 text-black dark:text-zinc-50">Add Food Intake</h2>
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              aria-label="Food name"
              placeholder="Food name (e.g., Apple, Sandwich)"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              aria-label="Calories"
              type="number"
              min={0}
              placeholder="Calories"
              value={calories as any}
              onChange={(e) => setCalories(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-40 rounded border px-3 py-2"
            />
            <div className="flex-1" />
          </div>

          <div className="flex justify-end">
            <button className="rounded-full bg-foreground px-4 py-2 text-background font-medium">Add</button>
          </div>
        </form>
      </div>

      <div className="w-full max-w-2xl mt-6">
        <h3 className="text-xl font-semibold mb-2 text-black dark:text-zinc-50">Food Log (by date)</h3>
        {dates.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">No food intakes logged yet.</p>
        ) : (
          <div className="space-y-4">
            {dates.map((d) => {
              const items = grouped[d];
              const total = items.reduce((s, it) => s + (it.calories || 0), 0);
              const sorted = items.sort((a, b) => (a.id < b.id ? 1 : -1));
              return (
                <div key={d} className="rounded border p-3 bg-white dark:bg-[#0b0b0b]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-black dark:text-zinc-50">{d}</div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">Total: {total} kcal</div>
                  </div>
                  <ul className="space-y-2">
                    {sorted.map((it) => (
                      <li key={it.id} className="flex justify-between items-center text-sm text-zinc-700 dark:text-zinc-300">
                        <div className="flex-1">
                          <div>{it.name}</div>
                          <div className="text-xs text-zinc-500">{it.calories} kcal</div>
                        </div>
                        <button
                          onClick={() => handleDelete(it.id)}
                          className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 ml-2"
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
