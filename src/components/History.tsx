"use client";

import { useState } from "react";
import { CaretLeft, CaretRight, Sneaker, Barbell, Trash } from "@phosphor-icons/react";

type RunRecord = {
  id: string;
  distance: number;
  minutes: number;
  seconds: number;
  created_at: string;
};

type WorkoutRecord = {
  id: string;
  exercises: { name: string; sets: { weight: string; reps: string }[] }[];
  created_at: string;
};

type Tab = "running" | "weight";

function formatPace(distanceKm: number, totalSeconds: number): string {
  if (distanceKm < 0.01) return "--'--\"";
  const paceSec = totalSeconds / distanceKm;
  const m = Math.floor(paceSec / 60);
  const s = Math.round(paceSec % 60);
  return `${m}'${String(s).padStart(2, "0")}"`;
}

function toDateKey(iso: string) {
  return iso.slice(0, 10); // "YYYY-MM-DD"
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0=일
}

export default function History() {
  const [tab, setTab] = useState<Tab>("running");
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([]);
  const [today] = useState(new Date());
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState<string | null>(null);

  const { year, month } = cursor;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const activeRecords = tab === "running" ? runs : workouts;
  const activeDays = new Set(activeRecords.map(r => toDateKey(r.created_at)));

  function prevMonth() {
    setSelected(null);
    setCursor(c => c.month === 0
      ? { year: c.year - 1, month: 11 }
      : { year: c.year, month: c.month - 1 });
  }

  function nextMonth() {
    setSelected(null);
    setCursor(c => c.month === 11
      ? { year: c.year + 1, month: 0 }
      : { year: c.year, month: c.month + 1 });
  }

  function selectDay(dateKey: string) {
    setSelected(s => s === dateKey ? null : dateKey);
  }

  function deleteRun(id: string) {
    setRuns(prev => prev.filter(r => r.id !== id));
  }

  function deleteWorkout(id: string) {
    setWorkouts(prev => prev.filter(w => w.id !== id));
  }

  const selectedRuns = selected ? runs.filter(r => toDateKey(r.created_at) === selected) : [];
  const selectedWorkouts = selected ? workouts.filter(w => toDateKey(w.created_at) === selected) : [];

  const todayKey = toDateKey(today.toISOString());

  return (
    <div className="max-w-lg mx-auto px-6 py-8 space-y-6">

      {/* 탭 */}
      <div className="flex gap-2">
        <button
          onClick={() => { setTab("running"); setSelected(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all ${
            tab === "running"
              ? "bg-orange-500/15 border-orange-500/30 text-orange-400"
              : "border-border text-fg-subtle hover:border-fg-subtle"
          }`}
        >
          <Sneaker size={16} weight={tab === "running" ? "fill" : "regular"} />
          러닝
        </button>
        <button
          onClick={() => { setTab("weight"); setSelected(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all ${
            tab === "weight"
              ? "bg-orange-500/15 border-orange-500/30 text-orange-400"
              : "border-border text-fg-subtle hover:border-fg-subtle"
          }`}
        >
          <Barbell size={16} weight={tab === "weight" ? "fill" : "regular"} />
          웨이트
        </button>
      </div>

      {/* 캘린더 */}
      <div className="rounded-xl bg-surface border border-border p-5 space-y-4">

        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="p-1.5 rounded-lg text-fg-subtle hover:text-fg hover:bg-surface-overlay transition-colors">
            <CaretLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-fg">
            {year}년 {month + 1}월
          </span>
          <button onClick={nextMonth} className="p-1.5 rounded-lg text-fg-subtle hover:text-fg hover:bg-surface-overlay transition-colors">
            <CaretRight size={16} />
          </button>
        </div>

        {/* 요일 */}
        <div className="grid grid-cols-7 text-center">
          {["일", "월", "화", "수", "목", "금", "토"].map(d => (
            <span key={d} className="text-xs text-fg-subtle pb-2">{d}</span>
          ))}
        </div>

        {/* 날짜 */}
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {Array.from({ length: firstDay }).map((_, i) => <span key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const hasRecord = activeDays.has(dateKey);
            const isToday = dateKey === todayKey;
            const isSelected = selected === dateKey;

            return (
              <button
                key={day}
                onClick={() => hasRecord && selectDay(dateKey)}
                disabled={!hasRecord}
                className={`relative mx-auto w-9 h-9 rounded-full text-sm transition-all flex items-center justify-center ${
                  isSelected
                    ? "bg-orange-500/20 text-orange-400 font-semibold"
                    : isToday
                    ? "text-orange-400 font-semibold"
                    : hasRecord
                    ? "text-fg hover:bg-surface-overlay cursor-pointer"
                    : "text-fg-subtle/40 cursor-default"
                }`}
              >
                {day}
                {hasRecord && (
                  <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                    isSelected ? "bg-orange-400" : "bg-orange-500/60"
                  }`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 선택된 날 상세 */}
      {selected && (
        <div className="space-y-2">
          <p className="text-xs text-fg-subtle uppercase tracking-widest px-1">
            {new Date(selected).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })}
          </p>

          {tab === "running" && selectedRuns.map(run => (
            <div key={run.id} className="rounded-xl bg-surface-raised border border-border px-4 py-3 flex items-center gap-4">
              <div className="flex-1">
                <p className="text-lg font-bold text-fg">{run.distance.toFixed(2)} km</p>
                <div className="flex gap-3 text-xs text-fg-muted mt-0.5">
                  <span>{String(run.minutes).padStart(2, "0")}:{String(run.seconds).padStart(2, "0")}</span>
                  <span>{formatPace(run.distance, run.minutes * 60 + run.seconds)} /km</span>
                </div>
              </div>
              <button
                onClick={() => deleteRun(run.id)}
                className="text-fg-subtle hover:text-red-400 transition-colors flex-shrink-0"
              >
                <Trash size={15} />
              </button>
            </div>
          ))}

          {tab === "weight" && selectedWorkouts.map(workout => (
            <div key={workout.id} className="rounded-xl bg-surface-raised border border-border px-4 py-3 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  {workout.exercises.map((ex, i) => (
                    <div key={i}>
                      <p className="text-sm font-medium text-fg">{ex.name}</p>
                      <p className="text-xs text-fg-muted">
                        {ex.sets.map((s, j) => `${j + 1}. ${s.weight}kg × ${s.reps}회`).join("  ")}
                      </p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => deleteWorkout(workout.id)}
                  className="text-fg-subtle hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <Trash size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
