"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Trash, X, MagnifyingGlass, CaretDown, MapPin } from "@phosphor-icons/react";
import { useExercises } from "@/hooks/useExercises";
import { useSettings } from "@/hooks/useSettings";
import { exerciseGroups, isBodyweight } from "@/data/exercises";
import HeroCarousel, { unsplash, type HeroItem } from "@/components/HeroCarousel";

type Set = { weight: string; reps: string };
type Exercise = { name: string; sets: Set[] };

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

// 맨몸 운동이면 무게 0, 아니면 빈 값
function defaultWeight(name: string): string {
  return isBodyweight(name) ? "0" : "";
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
  const [saved, setSaved] = useState(false);

  function saveWorkout() {
    const filled = exercises.filter(ex =>
      ex.sets.some(s => s.weight !== "" || s.reps !== "")
    );
    if (!filled.length) return;

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setExercises([newExercise()]);
  }

  function addExercise() {
    setExercises(prev => [...prev, newExercise()]);
  }

  function deleteExercise(exIdx: number) {
    setExercises(prev => prev.filter((_, i) => i !== exIdx));
  }

  function updateName(exIdx: number, name: string) {
    setExercises(prev =>
      prev.map((ex, i) =>
        i === exIdx
          ? {
              ...ex,
              name,
              // 빈 무게칸은 운동에 맞는 기본값(맨몸=0)으로 채움
              sets: ex.sets.map(s => ({ ...s, weight: s.weight === "" ? defaultWeight(name) : s.weight })),
            }
          : ex
      )
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

  function deleteSet(exIdx: number, setIdx: number) {
    setExercises(prev =>
      prev.map((ex, i) =>
        i === exIdx ? { ...ex, sets: ex.sets.filter((_, j) => j !== setIdx) } : ex
      )
    );
  }

  return (
    <div className="p-6 space-y-3 max-w-lg mx-auto">
      {/* 운동할 곳 찾기 */}
      <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 transition-colors text-sm font-medium">
        <MapPin size={16} weight="fill" />
        운동할 곳 찾기
      </button>

      {/* 광고 Hero (캐러셀) */}
      <HeroCarousel items={heroes} />

      {/* 운동 도구 */}
      <div className="rounded-xl bg-surface-raised border border-border px-4 py-2 divide-y divide-border">
        <Toggle label="시간 기록" on={tools.stopwatch} onChange={() => toggleTool("stopwatch")} />
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
              className="text-zinc-800 dark:text-zinc-200 hover:text-red-400 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

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
                <tr key={setIdx} className="border-b border-border-subtle">
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

      {/* 저장 */}
      <button
        onClick={saveWorkout}
        className="w-full py-3 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 transition-colors text-sm font-medium"
      >
        {saved ? "저장됨" : "오늘 운동 저장"}
      </button>
    </div>
  );
}
