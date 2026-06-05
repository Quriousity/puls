"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CaretLeft,
  CaretRight,
  Sneaker,
  Barbell,
  Path,
  Timer,
  Gauge,
  Stack,
  Repeat,
} from "@phosphor-icons/react";
import { supabase } from "@/lib/supabase";

type Run = {
  id: string;
  distance_km: number;
  duration_seconds: number;
  performed_on: string;
};

type Workout = {
  id: string;
  exercises: { name: string; sets: { weight: string; reps: string }[] }[];
  memo: string | null;
  performed_on: string;
};

function num(s: string): number {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function formatPace(distanceKm: number, totalSeconds: number): string {
  if (distanceKm < 0.01) return "--'--\"";
  const paceSec = totalSeconds / distanceKm;
  return `${Math.floor(paceSec / 60)}'${pad(Math.round(paceSec % 60))}"`;
}

function formatDurationSeconds(total: number): string {
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

// 통계 타일
function Stat({ icon: Icon, label, value, unit }: {
  icon: React.ElementType;
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="rounded-xl bg-surface border border-border px-3 py-3">
      <div className="flex items-center gap-1.5 text-fg-subtle mb-1.5">
        <Icon size={14} />
        <span className="text-[11px]">{label}</span>
      </div>
      <p className="text-xl font-bold text-fg tabular-nums leading-none">
        {value}
        {unit && <span className="text-xs font-medium text-fg-muted ml-1">{unit}</span>}
      </p>
    </div>
  );
}

export default function DailyReport({ onBack }: { onBack: () => void }) {
  const [runs, setRuns] = useState<Run[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  const [today] = useState(new Date());
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState(
    dateKey(today.getFullYear(), today.getMonth(), today.getDate())
  );

  useEffect(() => {
    (async () => {
      const [r, w] = await Promise.all([
        supabase.from("runs").select("id, distance_km, duration_seconds, performed_on"),
        supabase.from("workouts").select("id, exercises, memo, performed_on"),
      ]);
      if (r.data) setRuns(r.data as Run[]);
      if (w.data) setWorkouts(w.data as Workout[]);
      setLoading(false);
    })();
  }, []);

  const { year, month } = cursor;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());

  // 활동 있는 날짜 (점 표시)
  const activeDays = new Set([
    ...runs.map(r => r.performed_on),
    ...workouts.map(w => w.performed_on),
  ]);

  // 선택일 데이터
  const dayRuns = runs.filter(r => r.performed_on === selected);
  const dayWorkouts = workouts.filter(w => w.performed_on === selected);

  const totalDist = dayRuns.reduce((a, r) => a + r.distance_km, 0);
  const totalDur = dayRuns.reduce((a, r) => a + r.duration_seconds, 0);

  let exerciseCount = 0;
  let totalSets = 0;
  let totalVolume = 0;
  for (const w of dayWorkouts) {
    exerciseCount += w.exercises.length;
    for (const ex of w.exercises) {
      for (const s of ex.sets) {
        totalSets += 1;
        totalVolume += num(s.weight) * num(s.reps);
      }
    }
  }

  const hasRun = dayRuns.length > 0;
  const hasWeight = dayWorkouts.length > 0;
  const hasAny = hasRun || hasWeight;

  // 리포트 코멘트(문장형)
  const parts: string[] = [];
  if (hasRun) parts.push(`${totalDist.toFixed(2)}km 러닝`);
  if (hasWeight) parts.push(`웨이트 ${exerciseCount}개 운동(${totalSets}세트)`);
  const comment = hasAny ? `${parts.join(" · ")}을(를) 완료했어요.` : "이 날은 기록이 없어요.";

  function prevMonth() {
    setCursor(c => (c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }));
  }
  function nextMonth() {
    setCursor(c => (c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }));
  }

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg text-fg-muted hover:text-fg hover:bg-surface-overlay transition-colors"
          aria-label="뒤로"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-base font-semibold text-fg">일일 리포트</h2>
      </div>

      {/* 달력 */}
      <div className="rounded-xl bg-surface-raised border border-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="p-1.5 rounded-lg text-fg-subtle hover:text-fg hover:bg-surface-overlay transition-colors">
            <CaretLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-fg">{year}년 {month + 1}월</span>
          <button onClick={nextMonth} className="p-1.5 rounded-lg text-fg-subtle hover:text-fg hover:bg-surface-overlay transition-colors">
            <CaretRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-7 text-center">
          {["일", "월", "화", "수", "목", "금", "토"].map(d => (
            <span key={d} className="text-xs text-fg-subtle pb-2">{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1 text-center">
          {Array.from({ length: firstDay }).map((_, i) => <span key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const key = dateKey(year, month, day);
            const hasRecord = activeDays.has(key);
            const isToday = key === todayKey;
            const isSelected = key === selected;
            return (
              <button
                key={day}
                onClick={() => setSelected(key)}
                className={`relative mx-auto w-9 h-9 rounded-full text-sm transition-all flex items-center justify-center ${
                  isSelected
                    ? "bg-orange-500/20 text-orange-400 font-semibold"
                    : isToday
                    ? "text-orange-400 font-semibold"
                    : "text-fg hover:bg-surface-overlay"
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

      {/* 선택일 라벨 + 코멘트 */}
      <div className="space-y-1">
        <p className="text-sm font-semibold text-fg">
          {new Date(selected).toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" })}
        </p>
        <p className="text-sm text-fg-muted">{comment}</p>
      </div>

      {loading ? (
        <p className="text-sm text-fg-subtle text-center py-6">불러오는 중...</p>
      ) : !hasAny ? (
        <div className="rounded-xl bg-surface border border-border px-4 py-10 text-center">
          <p className="text-sm text-fg-subtle">이 날의 운동 기록이 없어요.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 러닝 */}
          {hasRun && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sneaker size={16} weight="fill" className="text-orange-400" />
                <span className="text-sm font-semibold text-fg">러닝</span>
                <span className="text-xs text-fg-subtle">{dayRuns.length}회</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Stat icon={Path} label="거리" value={totalDist.toFixed(2)} unit="km" />
                <Stat icon={Timer} label="시간" value={formatDurationSeconds(totalDur)} />
                <Stat icon={Gauge} label="평균 페이스" value={formatPace(totalDist, totalDur)} unit="/km" />
              </div>
            </div>
          )}

          {/* 웨이트 */}
          {hasWeight && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Barbell size={16} weight="fill" className="text-orange-400" />
                <span className="text-sm font-semibold text-fg">웨이트</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Stat icon={Barbell} label="운동" value={String(exerciseCount)} unit="개" />
                <Stat icon={Stack} label="총 세트" value={String(totalSets)} unit="세트" />
                <Stat icon={Repeat} label="총 볼륨" value={totalVolume.toLocaleString()} unit="kg" />
              </div>

              {/* 운동 목록 */}
              <div className="rounded-xl bg-surface-raised border border-border divide-y divide-border-subtle">
                {dayWorkouts.flatMap(w => w.exercises).map((ex, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-fg">{ex.name}</span>
                    <span className="text-xs text-fg-subtle">{ex.sets.length}세트</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
