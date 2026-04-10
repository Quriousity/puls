"use client";

import { useEffect, useState } from "react";
import { exerciseGroups, ExerciseGroup } from "@/data/exercises";
import { createClient } from "@/lib/supabase";

export function useExercises() {
  const [groups, setGroups] = useState<ExerciseGroup[]>(exerciseGroups);
  const [loaded, setLoaded] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_exercises")
        .select("groups")
        .eq("user_id", user.id)
        .single();

      if (data?.groups?.length) setGroups(data.groups);
      setLoaded(true);
    }
    load();
  }, []);

  useEffect(() => {
    if (!loaded) return;

    async function save() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("user_exercises")
        .upsert({ user_id: user.id, groups, updated_at: new Date().toISOString() });
    }
    save();
  }, [groups, loaded]);

  function addGroup(name: string) {
    setGroups(prev => [...prev, { group: name, items: [] }]);
  }

  function removeGroup(groupIdx: number) {
    setGroups(prev => prev.filter((_, i) => i !== groupIdx));
  }

  function addExercise(groupIdx: number, name: string) {
    setGroups(prev =>
      prev.map((g, i) => i === groupIdx ? { ...g, items: [...g.items, name] } : g)
    );
  }

  function removeExercise(groupIdx: number, itemIdx: number) {
    setGroups(prev =>
      prev.map((g, i) =>
        i === groupIdx ? { ...g, items: g.items.filter((_, j) => j !== itemIdx) } : g
      )
    );
  }

  return { groups, addGroup, removeGroup, addExercise, removeExercise };
}
