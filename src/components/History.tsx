"use client";

import { useEffect, useState } from "react";
import { CaretLeft, CaretRight, Sneaker, Barbell, Trash } from "@phosphor-icons/react";
import { supabase } from "@/lib/supabase";

type RunRecord = {
  id: string;
  distance_km: number;
  duration_seconds: number;
  performed_on: string; // "YYYY-MM-DD"
  created_at: string;
};

type WorkoutRecord = {
  id: string;
  exercises: { name: string; sets: { weight: string; reps: string }[] }[];
  memo: string | null;
  performed_on: string; // "YYYY-MM-DD"
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
  const [tab, setTab] = useState<Tab>("weight");
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [today] = useState(new Date());

  // 저장된 웨이트·러닝 기록 로드 (RLS 로 본인 것만 옴)
  useEffect(() => {
    (async () => {
      const [w, r] = await Promise.all([
        supabase
          .from("workouts")
          .select("id, exercises, memo, performed_on, created_at")
          .order("performed_on", { ascending: false }),
        supabase
          .from("runs")
          .select("id, distance_km, duration_seconds, performed_on, created_at")
          .order("performed_on", { ascending: false }),
      ]);

      if (w.error || r.error) setLoadError(w.error?.message ?? r.error?.message ?? "");
      else {
        setWorkouts((w.data ?? []) as WorkoutRecord[]);
        setRuns((r.data ?? []) as RunRecord[]);
      }
      setLoading(false);
    })();
  }, []);
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState<string | null>(null);

  const { year, month } = cursor;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const activeDays = new Set(
    tab === "running"
      ? runs.map(r => r.performed_on)
      : workouts.map(w => w.performed_on)
  );

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

  async function deleteRun(id: string) {
    const { error } = await supabase.from("runs").delete().eq("id", id);
    if (!error) setRuns(prev => prev.filter(r => r.id !== id));
  }

  async function deleteWorkout(id: string) {
    const { error } = await supabase.from("workouts").delete().eq("id", id);
    if (!error) setWorkouts(prev => prev.filter(w => w.id !== id));
  }

  // 날짜를 고르면 그날만, 안 고르면 전체(최신순)
  const shownRuns = selected ? runs.filter(r => r.performed_on === selected) : runs;
  const shownWorkouts = selected ? workouts.filter(w => w.performed_on === selected) : workouts;

  const todayKey = toDateKey(today.toISOString());

  return (
    <div className="max-w-lg mx-auto px-6 py-8 space-y-6">

      {/* 탭 */}
      <div className="flex gap-2">
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

      {/* 로드 에러 표시 */}
      {loadError && (
        <p className="text-sm text-red-400 text-center py-2">불러오기 오류: {loadError}</p>
      )}

      {/* 기록 없을 때 안내 */}
      {!loading && !loadError && (tab === "weight" ? workouts.length === 0 : runs.length === 0) && (
        <p className="text-sm text-fg-subtle text-center py-4">
          {tab === "weight"
            ? "저장된 운동 기록이 없어요. 웨이트 탭에서 운동을 저장해보세요."
            : "저장된 러닝 기록이 없어요. 러닝 탭에서 달려보세요."}
        </p>
      )}

      {/* 기록 목록 — 날짜 선택 시 그날만, 아니면 전체(최신순) */}
      {(tab === "running" ? shownRuns.length > 0 : shownWorkouts.length > 0) && (
        <div className="space-y-2">
          <p className="text-xs text-fg-subtle uppercase tracking-widest px-1">
            {selected
              ? new Date(selected).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })
              : "전체 기록"}
          </p>

          {tab === "running" && shownRuns.map(run => (
            <div key={run.id} className="rounded-xl bg-surface-raised border border-border px-4 py-3 flex items-center gap-4">
              <div className="flex-1">
                {!selected && (
                  <p className="text-xs text-fg-subtle">
                    {new Date(run.performed_on).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })}
                  </p>
                )}
                <p className="text-lg font-bold text-fg">{run.distance_km.toFixed(2)} km</p>
                <div className="flex gap-3 text-xs text-fg-muted mt-0.5">
                  <span>{String(Math.floor(run.duration_seconds / 60)).padStart(2, "0")}:{String(run.duration_seconds % 60).padStart(2, "0")}</span>
                  <span>{formatPace(run.distance_km, run.duration_seconds)} /km</span>
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

          {tab === "weight" && shownWorkouts.map(workout => (
            <div key={workout.id} className="rounded-xl bg-surface-raised border border-border px-4 py-3 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  {/* 전체 보기일 땐 카드마다 날짜 표시 */}
                  {!selected && (
                    <p className="text-xs text-fg-subtle">
                      {new Date(workout.performed_on).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })}
                    </p>
                  )}
                  {workout.exercises.map((ex, i) => (
                    <div key={i}>
                      <p className="text-sm font-medium text-fg">{ex.name}</p>
                      <p className="text-xs text-fg-muted">
                        {ex.sets.map((s, j) => `${j + 1}. ${s.weight}kg × ${s.reps}회`).join("  ")}
                      </p>
                    </div>
                  ))}
                  {workout.memo && (
                    <p className="text-xs text-fg-subtle italic pt-1 border-t border-border-subtle">
                      {workout.memo}
                    </p>
                  )}
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
