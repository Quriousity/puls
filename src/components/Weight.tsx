"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { Plus, Trash, X, MagnifyingGlass, CaretDown, MapPin } from "@phosphor-icons/react";
import { useExercises } from "@/hooks/useExercises";
import { useSettings } from "@/hooks/useSettings";
import { supabase } from "@/lib/supabase";
import { exerciseGroups, isBodyweight } from "@/data/exercises";
import HeroCarousel, { unsplash, type HeroItem } from "@/components/HeroCarousel";

type Set = { weight: string; reps: string; start?: number; end?: number };
type Exercise = { name: string; sets: Set[]; start?: number; end?: number };

// 광고용 hero (웨이트)
const heroes: HeroItem[] = [
  { img: unsplash("1517836357463-d25dfeac3438"), title: "한 세트 더, 한계를 넘어라", sub: "프리미엄 스트랩 · 벨트 · 보호대" },
  { img: unsplash("1539794830467-1f1755804d13"), title: "운동복도 실력이다", sub: "프리미엄 짐웨어 컬렉션" },
  { img: unsplash("1593095948071-474c5cc2989d"), title: "운동만큼 중요한 회복", sub: "프로틴 파우더" },
];

function Toggle({
  label,
  on,
  onChange,
}: {
  label: string;
  on: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-fg-muted">{label}</span>
      <button
        role="switch"
        aria-checked={on}
        onClick={onChange}
        className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${
          on ? "bg-orange-500/70" : "bg-surface-overlay border border-border"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            on ? "translate-x-4" : ""
          }`}
        />
      </button>
    </div>
  );
}

// 시간 기록 클러스터: 라벨 …… [start] 타이머 [end]
// 세트별·운동별 공용. 입력칸과 분리된 별도 라인으로 배치해서 씀.
function TimeTracker({
  label,
  start,
  end,
  now,
  onStart,
  onEnd,
}: {
  label: string;
  start?: number;
  end?: number;
  now: number;
  onStart: () => void;
  onEnd: () => void;
}) {
  const running = !!start && !end;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-fg-subtle">{label}</span>
      <button
        onClick={onStart}
        className={`text-[11px] px-2 py-1 rounded-md border transition-colors ${
          start
            ? "bg-orange-500/20 border-orange-500/40 text-orange-400"
            : "border-border text-fg-muted hover:border-fg-subtle"
        }`}
      >
        {start ? formatClock(start) : "start"}
      </button>
      <span
        className={`text-xs tabular-nums w-16 text-center ${
          running ? "text-orange-400 font-semibold" : "text-fg-subtle"
        }`}
      >
        {start ? formatElapsed((end ?? now) - start) : "0:00.00"}
      </span>
      <button
        onClick={onEnd}
        disabled={!start || !!end}
        className={`text-[11px] px-2 py-1 rounded-md border transition-colors disabled:opacity-40 ${
          end
            ? "bg-orange-500/20 border-orange-500/40 text-orange-400"
            : "border-border text-fg-muted hover:border-fg-subtle disabled:hover:border-border"
        }`}
      >
        {end ? formatClock(end) : "end"}
      </button>
    </div>
  );
}

// 맨몸 운동이면 무게 0, 아니면 빈 값
function defaultWeight(name: string): string {
  return isBodyweight(name) ? "0" : "";
}

// 경과 시간(ms)을 m:ss.cc(센티초) 형태로 (타이머 표시 — 긴박하게 빠르게 흐름)
function formatElapsed(ms: number): string {
  const clamped = Math.max(0, ms);
  const m = Math.floor(clamped / 60000);
  const s = Math.floor((clamped % 60000) / 1000);
  const cs = Math.floor((clamped % 1000) / 10);
  return `${m}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

// 기록 시각을 HH:MM 으로 (start/end 버튼 라벨)
function formatClock(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function newExercise(name = exerciseGroups[0].items[0]): Exercise {
  return { name, sets: [{ weight: defaultWeight(name), reps: "" }] };
}

function ExerciseSelect({
  value,
  onChange,
  groups,
}: {
  value: string;
  onChange: (name: string) => void;
  groups: { group: string; items: string[] }[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allExercises = groups.flatMap(g => g.items);
  const isSearching = query.length > 0;
  const flatFiltered = allExercises.filter(o => o.includes(query));

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function select(name: string) {
    onChange(name);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-surface-overlay text-fg text-sm rounded-lg px-3 py-1.5 border border-border hover:border-fg-subtle transition-colors"
      >
        <span>{value}</span>
        <CaretDown size={13} className={`text-fg-subtle transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-surface-overlay border border-border rounded-xl shadow-lg z-10 overflow-hidden">
          {/* 검색 */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <MagnifyingGlass size={14} className="text-fg-subtle flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="검색"
              className="w-full bg-transparent text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-fg-subtle outline-none"
            />
          </div>

          {/* 목록 */}
          <ul className="max-h-64 overflow-y-auto py-1">
            {isSearching ? (
              flatFiltered.length > 0 ? (
                flatFiltered.map(opt => (
                  <li key={opt}>
                    <button
                      onClick={() => select(opt)}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        opt === value ? "text-fg bg-surface-raised" : "text-fg-muted hover:text-fg hover:bg-surface-raised"
                      }`}
                    >
                      {opt}
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-3 py-3 text-sm text-fg-subtle text-center">결과 없음</li>
              )
            ) : (
              exerciseGroups.map(({ group, items }) => (
                <li key={group}>
                  <p className="px-3 pt-3 pb-1 text-xs font-semibold text-fg-subtle uppercase tracking-wider">
                    {group}
                  </p>
                  <ul>
                    {items.map(opt => (
                      <li key={opt}>
                        <button
                          onClick={() => select(opt)}
                          className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                            opt === value ? "text-fg bg-surface-raised" : "text-fg-muted hover:text-fg hover:bg-surface-raised"
                          }`}
                        >
                          {opt}
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function Weight() {
  const { groups } = useExercises();
  const { tools, toggleTool } = useSettings();
  const [exercises, setExercises] = useState<Exercise[]>([newExercise()]);
  const [memo, setMemo] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  // 시간 기록 토글을 끌 때 초기화 확인 모달 ("stopwatch" | "stopwatchExercise" | null)
  const [confirmOff, setConfirmOff] = useState<"stopwatch" | "stopwatchExercise" | null>(null);

  // 라이브 타이머: 진행 중인 세트(start만 찍힘)가 있으면 센티초 단위로 빠르게 갱신
  const [now, setNow] = useState(() => Date.now());
  const anyRunning = exercises.some(
    ex => (ex.start && !ex.end) || ex.sets.some(s => s.start && !s.end)
  );
  useEffect(() => {
    if (!anyRunning) return;
    const id = setInterval(() => setNow(Date.now()), 30);
    return () => clearInterval(id);
  }, [anyRunning]);

  async function saveWorkout() {
    const filled = exercises.filter(ex =>
      ex.sets.some(s => s.weight !== "" || s.reps !== "")
    );
    if (!filled.length || saving) return;

    setSaving(true);
    setSaveError("");
    // 오늘 운동을 한 행으로 저장 (exercises 배열을 jsonb 로 통째로)
    // user_id 는 DB default auth.uid() 로 자동 채워짐
    // performed_on 은 로컬 날짜로 명시 (DB 기본값 current_date 는 UTC라 캘린더와 어긋날 수 있음)
    const d = new Date();
    const performedOn = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const { error } = await supabase.from("workouts").insert({
      performed_on: performedOn,
      memo: tools.memo && memo.trim() ? memo.trim() : null,
      exercises: filled,
    });
    setSaving(false);

    if (error) {
      setSaveError(error.message);
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setExercises([newExercise()]);
    setMemo("");
  }

  function addExercise() {
    setExercises(prev => [...prev, newExercise()]);
  }

  function deleteExercise(exIdx: number) {
    setExercises(prev => prev.filter((_, i) => i !== exIdx));
  }

  function updateName(exIdx: number, name: string) {
    setExercises(prev =>
      prev.map((ex, i) => {
        if (i !== exIdx) return ex;
        // 사용자가 안 건드린 무게칸(= 이전 운동의 기본값 그대로)만 새 운동 기본값으로 교체.
        // 예: 맨몸 스쿼트("0") → 바벨 스쿼트("") 로 0이 남지 않게.
        const oldDefault = defaultWeight(ex.name);
        return {
          ...ex,
          name,
          sets: ex.sets.map(s => ({
            ...s,
            weight: s.weight === oldDefault ? defaultWeight(name) : s.weight,
          })),
        };
      })
    );
  }

  function addSet(exIdx: number) {
    setExercises(prev =>
      prev.map((ex, i) =>
        i === exIdx ? { ...ex, sets: [...ex.sets, { weight: defaultWeight(ex.name), reps: "" }] } : ex
      )
    );
  }

  function updateSet(exIdx: number, setIdx: number, field: keyof Set, value: string) {
    setExercises(prev =>
      prev.map((ex, i) =>
        i === exIdx
          ? { ...ex, sets: ex.sets.map((s, j) => (j === setIdx ? { ...s, [field]: value } : s)) }
          : ex
      )
    );
  }

  // 세트 시작/종료 시각 기록 (시간 기록 토글용)
  // start: 현재 시각 기록 + 타이머 시작(이전 end 초기화) / end: 현재 시각 기록 + 타이머 정지
  function markTime(exIdx: number, setIdx: number, field: "start" | "end") {
    const ts = Date.now();
    setExercises(prev =>
      prev.map((ex, i) =>
        i === exIdx
          ? {
              ...ex,
              sets: ex.sets.map((s, j) =>
                j === setIdx
                  ? field === "start"
                    ? { ...s, start: ts, end: undefined }
                    : { ...s, end: ts }
                  : s
              ),
            }
          : ex
      )
    );
  }

  // 운동 블록 전체 시작/종료 시각 기록 (시간 기록(운동별) 토글용)
  function markExerciseTime(exIdx: number, field: "start" | "end") {
    const ts = Date.now();
    setExercises(prev =>
      prev.map((ex, i) =>
        i === exIdx
          ? field === "start"
            ? { ...ex, start: ts, end: undefined }
            : { ...ex, end: ts }
          : ex
      )
    );
  }

  // 해당 시간 기록에 실제로 찍힌 값이 있는지 (있을 때만 끌 때 확인 모달)
  function hasRecordedTimes(key: "stopwatch" | "stopwatchExercise"): boolean {
    return key === "stopwatch"
      ? exercises.some(ex => ex.sets.some(s => s.start || s.end))
      : exercises.some(ex => ex.start || ex.end);
  }

  // 시간 기록 토글 요청: 끄는데 기록이 있으면 확인 모달, 그 외엔 바로 토글
  function requestToggleTimer(key: "stopwatch" | "stopwatchExercise") {
    const turningOff = tools[key];
    if (turningOff && hasRecordedTimes(key)) {
      setConfirmOff(key);
    } else {
      toggleTool(key);
    }
  }

  // 모달 확인: 기록 초기화 후 토글 끄기
  function confirmToggleOff() {
    if (!confirmOff) return;
    if (confirmOff === "stopwatch") {
      setExercises(prev =>
        prev.map(ex => ({ ...ex, sets: ex.sets.map(s => ({ ...s, start: undefined, end: undefined })) }))
      );
    } else {
      setExercises(prev => prev.map(ex => ({ ...ex, start: undefined, end: undefined })));
    }
    toggleTool(confirmOff);
    setConfirmOff(null);
  }

  function deleteSet(exIdx: number, setIdx: number) {
    setExercises(prev =>
      prev.map((ex, i) =>
        i === exIdx ? { ...ex, sets: ex.sets.filter((_, j) => j !== setIdx) } : ex
      )
    );
  }

  return (
    <div className="p-6 space-y-3 max-w-lg mx-auto">
      {/* 운동할 곳 찾기 — 카카오맵 헬스장 검색을 새창으로 */}
      <a
        href="https://map.kakao.com/?q=헬스장"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 transition-colors text-sm font-medium"
      >
        <MapPin size={16} weight="fill" />
        운동할 곳 찾기
      </a>

      {/* 광고 Hero (캐러셀) */}
      <HeroCarousel items={heroes} />

      {/* 운동 도구 */}
      <div className="rounded-xl bg-surface-raised border border-border px-4 py-2 divide-y divide-border">
        <Toggle label="시간 기록(세트별)" on={tools.stopwatch} onChange={() => requestToggleTimer("stopwatch")} />
        <Toggle label="시간 기록(운동별)" on={tools.stopwatchExercise} onChange={() => requestToggleTimer("stopwatchExercise")} />
        <Toggle label="메모" on={tools.memo} onChange={() => toggleTool("memo")} />
      </div>

      {exercises.map((ex, exIdx) => (
        <div key={exIdx} className="rounded-xl bg-surface p-4 space-y-3 border border-border">
          {/* 운동 선택 */}
          <div className="flex items-center gap-2">
            <ExerciseSelect
              value={ex.name}
              onChange={name => updateName(exIdx, name)}
              groups={groups}
            />
            <button
              onClick={() => deleteExercise(exIdx)}
              className="ml-auto text-zinc-800 dark:text-zinc-200 hover:text-red-400 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* 시간 기록(운동별): 입력칸과 분리된 별도 바 */}
          {tools.stopwatchExercise && (
            <div className="-mt-1 pb-1">
              <TimeTracker
                label="운동 시간"
                start={ex.start}
                end={ex.end}
                now={now}
                onStart={() => markExerciseTime(exIdx, "start")}
                onEnd={() => markExerciseTime(exIdx, "end")}
              />
            </div>
          )}

          {/* 테이블 */}
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-zinc-800 dark:text-zinc-200 text-left border-b border-border">
                <th className="pb-2 font-medium w-10">#</th>
                <th className="pb-2 font-medium w-28">무게</th>
                <th className="pb-2 font-medium w-28">횟수</th>
                <th className="pb-2 w-8" />
              </tr>
            </thead>
            <tbody>
              {ex.sets.map((set, setIdx) => (
                <Fragment key={setIdx}>
                  <tr className={tools.stopwatch ? "" : "border-b border-border-subtle"}>
                    <td className="py-2 text-zinc-800 dark:text-zinc-200">{setIdx + 1}</td>
                    <td className="py-2 pr-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={set.weight}
                        onChange={e => updateSet(exIdx, setIdx, "weight", e.target.value)}
                        placeholder="kg"
                        className="w-full bg-surface-overlay rounded-md px-2.5 py-1 text-zinc-800 dark:text-zinc-200 placeholder:text-fg-subtle outline-none focus:ring-1 focus:ring-border"
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={set.reps}
                        onChange={e => updateSet(exIdx, setIdx, "reps", e.target.value)}
                        placeholder="회"
                        className="w-full bg-surface-overlay rounded-md px-2.5 py-1 text-zinc-800 dark:text-zinc-200 placeholder:text-fg-subtle outline-none focus:ring-1 focus:ring-border"
                      />
                    </td>
                    <td className="py-2">
                      <div className="flex justify-center">
                        <button
                          onClick={() => deleteSet(exIdx, setIdx)}
                          className="text-zinc-800 dark:text-zinc-200 hover:text-red-400 transition-colors"
                        >
                          <Trash size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* 시간 기록(세트별): 입력 행과 분리된 별도 라인 */}
                  {tools.stopwatch && (
                    <tr className="border-b border-border-subtle">
                      <td />
                      <td colSpan={3} className="pb-2.5">
                        <TimeTracker
                          label={`${setIdx + 1}세트 시간`}
                          start={set.start}
                          end={set.end}
                          now={now}
                          onStart={() => markTime(exIdx, setIdx, "start")}
                          onEnd={() => markTime(exIdx, setIdx, "end")}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>

          {/* 세트 추가 */}
          <button
            onClick={() => addSet(exIdx)}
            className="flex items-center gap-1.5 text-xs text-zinc-800 dark:text-zinc-200 hover:text-fg-muted transition-colors"
          >
            <Plus size={13} />
            세트 추가
          </button>
        </div>
      ))}

      {/* 운동 추가 */}
      <button
        onClick={addExercise}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-surface border border-border text-fg text-sm font-medium hover:bg-surface-overlay transition-colors"
      >
        <Plus size={15} />
        운동 추가
      </button>

      {/* 메모 (토글 켜졌을 때만 노출) */}
      {tools.memo && (
        <textarea
          value={memo}
          onChange={e => setMemo(e.target.value)}
          placeholder="오늘 운동 메모"
          rows={3}
          className="w-full resize-none bg-surface border border-border rounded-xl px-4 py-3 text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-fg-subtle outline-none focus:ring-1 focus:ring-border"
        />
      )}

      {/* 저장 */}
      {saveError && <p className="text-sm text-red-400 px-1">{saveError}</p>}
      <button
        onClick={saveWorkout}
        disabled={saving}
        className="w-full py-3 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 transition-colors text-sm font-medium disabled:opacity-50"
      >
        {saving ? "저장 중..." : saved ? "저장됨" : "오늘 운동 저장"}
      </button>

      {/* 시간 기록 끄기 확인 모달 */}
      {confirmOff && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50"
          onClick={() => setConfirmOff(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={e => e.stopPropagation()}
            className="w-full max-w-xs rounded-2xl bg-surface-raised border border-border p-5 shadow-xl space-y-4"
          >
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-fg">
                {confirmOff === "stopwatch" ? "시간 기록(세트별) 끄기" : "시간 기록(운동별) 끄기"}
              </p>
              <p className="text-sm text-fg-muted">
                지금까지 기록된 시간이 모두 초기화됩니다. 끄시겠어요?
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmOff(null)}
                className="flex-1 py-2.5 rounded-xl bg-surface border border-border text-fg text-sm font-medium hover:bg-surface-overlay transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmToggleOff}
                className="flex-1 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/25 transition-colors"
              >
                끄기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
