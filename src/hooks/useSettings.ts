"use client";

import { useEffect, useState } from "react";

export type ToolSettings = {
  stopwatch: boolean;         // 시간 기록(세트별)
  stopwatchExercise: boolean; // 시간 기록(운동별)
  memo: boolean;              // 메모
};

const DEFAULT_TOOLS: ToolSettings = {
  stopwatch: false,
  stopwatchExercise: false,
  memo: false,
};

const STORAGE_KEY = "puls.tools";

export function useSettings() {
  const [tools, setTools] = useState<ToolSettings>(DEFAULT_TOOLS);

  // 최초 마운트 시 localStorage에서 로드 (SSR 하이드레이션 불일치 방지)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTools({ ...DEFAULT_TOOLS, ...JSON.parse(raw) });
    } catch {
      /* 무시 */
    }
  }, []);

  function toggleTool(key: keyof ToolSettings) {
    setTools(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* 무시 */
      }
      return next;
    });
  }

  return { tools, toggleTool };
}
