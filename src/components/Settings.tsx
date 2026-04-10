"use client";

import { useState } from "react";
import { Plus, Trash, X } from "@phosphor-icons/react";
import { useExercises } from "@/hooks/useExercises";

function AddInput({
  placeholder,
  onAdd,
}: {
  placeholder: string;
  onAdd: (value: string) => void;
}) {
  const [value, setValue] = useState("");

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue("");
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === "Enter" && submit()}
        placeholder={placeholder}
        className="flex-1 bg-surface text-fg text-sm rounded-lg px-3 py-1.5 border border-border placeholder:text-fg-subtle outline-none focus:ring-1 focus:ring-border"
      />
      <button
        onClick={submit}
        className="p-1.5 rounded-lg bg-surface text-fg-muted hover:text-fg border border-border transition-colors"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}

export default function Settings() {
  const { groups, addGroup, removeGroup, addExercise, removeExercise } = useExercises();

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <h2 className="text-base font-semibold text-fg">운동 목록 관리</h2>

      <div className="space-y-3">
        {groups.map((g, groupIdx) => (
          <div key={groupIdx} className="rounded-xl bg-surface-raised border border-border p-4 space-y-3">
            {/* 그룹 헤더 */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xs font-semibold text-fg uppercase tracking-wider">
                {g.group}
              </span>
              <button
                onClick={() => removeGroup(groupIdx)}
                className="text-fg-subtle hover:text-red-400 transition-colors"
              >
                <Trash size={15} />
              </button>
            </div>

            {/* 운동 목록 */}
            {g.items.length > 0 && (
              <ul className="space-y-1">
                {g.items.map((item, itemIdx) => (
                  <li
                    key={itemIdx}
                    className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-surface-overlay group"
                  >
                    <span className="text-sm text-fg-muted">{item}</span>
                    <button
                      onClick={() => removeExercise(groupIdx, itemIdx)}
                      className="text-fg-subtle hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* 운동 추가 */}
            <AddInput
              placeholder="운동 추가"
              onAdd={name => addExercise(groupIdx, name)}
            />
          </div>
        ))}
      </div>

      {/* 그룹 추가 */}
      <div className="rounded-xl bg-surface-raised p-4 space-y-2">
        <span className="text-xs font-semibold text-fg-subtle uppercase tracking-wider">
          새 그룹
        </span>
        <AddInput
          placeholder="그룹 이름"
          onAdd={addGroup}
        />
      </div>
    </div>
  );
}
