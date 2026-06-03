"use client";

import { useState } from "react";
import { exerciseGroups, ExerciseGroup } from "@/data/exercises";

export function useExercises() {
  const [groups, setGroups] = useState<ExerciseGroup[]>(exerciseGroups);

  function addGroup(name: string) {
    setGroups(prev => [...prev, { group: name, items: [] }]);
  }

  function removeGroup(groupIdx: number) {
    setGroups(prev => prev.filter((_, i) => i !== groupIdx));
  }

  function addExercise(groupIdx: number, name: string) {
    setGroups(prev =>
      prev.map((g, i) => (i === groupIdx ? { ...g, items: [...g.items, name] } : g))
    );
  }

  function removeExercise(groupIdx: number, itemIdx: number) {
    setGroups(prev =>
      prev.map((g, i) =>
        i === groupIdx ? { ...g, items: g.items.filter((_, j) => j !== itemIdx) } : g
      )
    );
  }

  // 기본값(디폴트 운동 목록)으로 복원
  function resetGroups() {
    setGroups(exerciseGroups);
  }

  return { groups, addGroup, removeGroup, addExercise, removeExercise, resetGroups };
}
