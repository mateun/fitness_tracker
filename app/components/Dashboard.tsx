"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

type Food = { id: string; name: string; calories: number; date: string };
type Workout = { id: string; date: string; title: string; duration: number };

const FOOD_KEY = "foodIntake";
const WORKOUT_KEY = "workouts";

function lastNDates(n: number) {
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export default function Dashboard() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    try {
      const fRaw = localStorage.getItem(FOOD_KEY);
      const wRaw = localStorage.getItem(WORKOUT_KEY);
      setFoods(fRaw ? (JSON.parse(fRaw) as Food[]) : []);
      setWorkouts(wRaw ? (JSON.parse(wRaw) as Workout[]) : []);
    } catch {
      setFoods([]);
      setWorkouts([]);
    }
  }, []);

  const dates = useMemo(() => lastNDates(7), []);

  const foodSeries = useMemo(() => {
    const map = Object.fromEntries(dates.map((d) => [d, 0]));
    for (const f of foods) {
      if (f.date in map) map[f.date] += Number(f.calories || 0);
    }
    return dates.map((d) => ({ date: d, calories: map[d] }));
  }, [dates, foods]);

  const workoutSeries = useMemo(() => {
    const map = Object.fromEntries(dates.map((d) => [d, 0]));
    for (const w of workouts) {
      if (w.date in map) map[w.date] += Number(w.duration || 0);
    }
    return dates.map((d) => ({ date: d, minutes: map[d] }));
  }, [dates, workouts]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 w-full">
      <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">Last 7 days — Highlights</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border p-4 bg-white dark:bg-[#0b0b0b]">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium text-black dark:text-zinc-50">Calories (7d)</div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">Total: {foodSeries.reduce((s, i) => s + i.calories, 0)} kcal</div>
          </div>
          <div style={{ width: "100%", height: 180 }}>
            <ResponsiveContainer>
              <BarChart data={foodSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="calories" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border p-4 bg-white dark:bg-[#0b0b0b]">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium text-black dark:text-zinc-50">Workouts (7d)</div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">Total min: {workoutSeries.reduce((s, i) => s + i.minutes, 0)} min</div>
          </div>
          <div style={{ width: "100%", height: 180 }}>
            <ResponsiveContainer>
              <LineChart data={workoutSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="minutes" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
