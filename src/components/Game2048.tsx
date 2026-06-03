"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowsClockwise, ArrowLeft } from "@phosphor-icons/react";

const SIZE = 4;
type Grid = number[][];
type Dir = "up" | "down" | "left" | "right";

// 타일 색상 (다크/라이트 공통으로 무난한 오렌지 계열 그라데이션)
const tileStyle: Record<number, string> = {
  0:    "bg-surface-overlay",
  2:    "bg-zinc-200 text-zinc-800 dark:bg-zinc-600 dark:text-zinc-100",
  4:    "bg-zinc-300 text-zinc-800 dark:bg-zinc-500 dark:text-zinc-100",
  8:    "bg-orange-300 text-zinc-900",
  16:   "bg-orange-400 text-zinc-900",
  32:   "bg-orange-500 text-white",
  64:   "bg-orange-600 text-white",
  128:  "bg-amber-400 text-zinc-900",
  256:  "bg-amber-500 text-white",
  512:  "bg-amber-600 text-white",
  1024: "bg-yellow-400 text-zinc-900",
  2048: "bg-yellow-500 text-zinc-900",
};

function emptyGrid(): Grid {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function clone(g: Grid): Grid {
  return g.map(row => [...row]);
}

// 빈 칸에 새 타일(2 또는 4) 추가
function addRandomTile(g: Grid) {
  const empty: [number, number][] = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (g[r][c] === 0) empty.push([r, c]);
  if (!empty.length) return;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  g[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function newGame(): Grid {
  const g = emptyGrid();
  addRandomTile(g);
  addRandomTile(g);
  return g;
}

// 한 줄을 왼쪽으로 슬라이드 + 병합. 점수 증가분 반환
function slideRow(row: number[]): { row: number[]; gained: number } {
  const nums = row.filter(n => n !== 0);
  let gained = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    if (nums[i] === nums[i + 1]) {
      nums[i] *= 2;
      gained += nums[i];
      nums.splice(i + 1, 1);
    }
  }
  while (nums.length < SIZE) nums.push(0);
  return { row: nums, gained };
}

// 방향에 맞춰 그리드를 왼쪽 기준으로 정규화하기 위한 회전 헬퍼
function transpose(g: Grid): Grid {
  return g[0].map((_, c) => g.map(row => row[c]));
}
function reverseRows(g: Grid): Grid {
  return g.map(row => [...row].reverse());
}

function move(g: Grid, dir: Dir): { grid: Grid; gained: number; moved: boolean } {
  let work = clone(g);
  // 모든 방향을 "왼쪽 슬라이드"로 변환
  if (dir === "up") work = transpose(work);
  if (dir === "down") work = reverseRows(transpose(work));
  if (dir === "right") work = reverseRows(work);

  let gained = 0;
  work = work.map(row => {
    const res = slideRow(row);
    gained += res.gained;
    return res.row;
  });

  // 원래 방향으로 복원
  if (dir === "up") work = transpose(work);
  if (dir === "down") work = transpose(reverseRows(work));
  if (dir === "right") work = reverseRows(work);

  const moved = JSON.stringify(work) !== JSON.stringify(g);
  return { grid: work, gained, moved };
}

function hasMoves(g: Grid): boolean {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (g[r][c] === 0) return true;
      if (c < SIZE - 1 && g[r][c] === g[r][c + 1]) return true;
      if (r < SIZE - 1 && g[r][c] === g[r + 1][c]) return true;
    }
  return false;
}

function reached2048(g: Grid): boolean {
  return g.some(row => row.some(n => n >= 2048));
}

export default function Game2048({ onExit }: { onExit?: () => void }) {
  const [grid, setGrid] = useState<Grid>(newGame);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [won, setWon] = useState(false);
  const [over, setOver] = useState(false);

  // best 점수 localStorage 연동
  useEffect(() => {
    const saved = Number(localStorage.getItem("puls-2048-best") || 0);
    setBest(saved);
  }, []);
  useEffect(() => {
    if (score > best) {
      setBest(score);
      localStorage.setItem("puls-2048-best", String(score));
    }
  }, [score, best]);

  const reset = useCallback(() => {
    setGrid(newGame());
    setScore(0);
    setWon(false);
    setOver(false);
  }, []);

  const doMove = useCallback(
    (dir: Dir) => {
      if (over) return;
      setGrid(prev => {
        const { grid: next, gained, moved } = move(prev, dir);
        if (!moved) return prev;
        addRandomTile(next);
        setScore(s => s + gained);
        if (!won && reached2048(next)) setWon(true);
        if (!hasMoves(next)) setOver(true);
        return next;
      });
    },
    [over, won]
  );

  // 키보드 입력
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const map: Record<string, Dir> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };
      const dir = map[e.key];
      if (dir) {
        e.preventDefault();
        doMove(dir);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doMove]);

  // 스와이프 입력 (포인터 이벤트 — 마우스 드래그 + 터치 모두 지원)
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  function onPointerDown(e: React.PointerEvent) {
    dragStart.current = { x: e.clientX, y: e.clientY };
  }
  function onPointerUp(e: React.PointerEvent) {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    dragStart.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return; // 너무 작은 움직임 무시
    if (Math.abs(dx) > Math.abs(dy)) doMove(dx > 0 ? "right" : "left");
    else doMove(dy > 0 ? "down" : "up");
  }

  return (
    <div className="p-6 max-w-md mx-auto select-none">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {onExit && (
            <button
              onClick={onExit}
              className="p-1.5 rounded-md text-fg-muted hover:text-fg hover:bg-surface-overlay transition-colors"
              aria-label="돌아가기"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-fg">2048</h1>
        </div>
        <div className="flex items-center gap-2">
          <ScoreBox label="점수" value={score} />
          <ScoreBox label="최고" value={best} />
        </div>
      </div>

      <p className="text-sm text-fg-muted mb-3">
        방향키 또는 스와이프로 타일을 움직여 같은 숫자를 합쳐 2048을 만들어보세요.
      </p>

      {/* 보드 */}
      <div
        className="relative rounded-xl bg-surface-raised border border-border p-2 cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <div className="grid grid-cols-4 gap-2">
          {grid.flat().map((val, i) => (
            <div
              key={i}
              className={`aspect-square rounded-lg flex items-center justify-center font-bold transition-colors ${
                tileStyle[val] ?? "bg-yellow-600 text-white"
              } ${val >= 1024 ? "text-xl" : val >= 128 ? "text-2xl" : "text-3xl"}`}
            >
              {val !== 0 && val}
            </div>
          ))}
        </div>

        {/* 종료/승리 오버레이 */}
        {(over || won) && (
          <div className="absolute inset-0 rounded-xl bg-surface/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
            <p className="text-2xl font-bold text-fg">
              {over ? "게임 오버" : "2048 달성! 🎉"}
            </p>
            <p className="text-sm text-fg-muted">최종 점수 {score}</p>
            <div className="flex gap-2">
              {won && !over && (
                <button
                  onClick={() => setWon(false)}
                  className="px-4 py-2 rounded-lg bg-surface-overlay border border-border text-fg text-sm font-medium hover:bg-surface-hover transition-colors"
                >
                  계속하기
                </button>
              )}
              <button
                onClick={reset}
                className="px-4 py-2 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 text-sm font-medium transition-colors"
              >
                다시 시작
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 새 게임 */}
      <button
        onClick={reset}
        className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-surface border border-border text-fg text-sm font-medium hover:bg-surface-overlay transition-colors"
      >
        <ArrowsClockwise size={15} />
        새 게임
      </button>
    </div>
  );
}

function ScoreBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-surface-overlay border border-border px-3 py-1 text-center min-w-16">
      <p className="text-[10px] uppercase tracking-wider text-fg-subtle">{label}</p>
      <p className="text-base font-bold text-fg tabular-nums">{value}</p>
    </div>
  );
}
