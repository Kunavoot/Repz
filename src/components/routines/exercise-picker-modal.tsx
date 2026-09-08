"use client";

import React, { useState, useMemo } from "react";
import { X, Search, Dumbbell, Plus } from "lucide-react";
import { MUSCLE_GROUPS } from "@/lib/exercise-options";
import { CustomExerciseModal } from "./custom-exercise-modal";

interface ExerciseItem {
  id: string;
  name: string;
  thaiName: string | null;
  targetMuscle: string | null;
  equipmentType: string | null;
  isCustom: boolean;
}

interface ExercisePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exercise: ExerciseItem) => void;
  exercises: ExerciseItem[];
  onRefreshExercises?: () => void;
}

export function ExercisePickerModal({
  isOpen,
  onClose,
  onSelect,
  exercises,
  onRefreshExercises,
}: ExercisePickerModalProps) {
  const [query, setQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState<string>("ALL");
  const [isAddCustomOpen, setIsAddCustomOpen] = useState(false);

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const q = query.toLowerCase().trim();
      const matchQuery =
        !q ||
        ex.name.toLowerCase().includes(q) ||
        (ex.thaiName && ex.thaiName.toLowerCase().includes(q)) ||
        (ex.targetMuscle && ex.targetMuscle.toLowerCase().includes(q));

      const matchMuscle =
        selectedMuscle === "ALL" ||
        (ex.targetMuscle && ex.targetMuscle.toLowerCase().includes(selectedMuscle.toLowerCase()));

      return matchQuery && matchMuscle;
    });
  }, [exercises, query, selectedMuscle]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div
          className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-lime-400" />
                เลือกท่าออกกำลังกาย
              </h2>
              <p className="text-xs text-zinc-400">เลือกท่าเพื่อเพิ่มลงในวันฝึกนี้</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddCustomOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime-400/10 border border-lime-400/30 text-lime-400 hover:bg-lime-400/20 text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มท่าใหม่</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search bar & Filter Chips */}
          <div className="p-4 border-b border-zinc-800/80 space-y-3 bg-zinc-950/30">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อท่า (อังกฤษ / ไทย)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400/60 transition"
              />
            </div>

            {/* Muscle Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              <button
                onClick={() => setSelectedMuscle("ALL")}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedMuscle === "ALL"
                    ? "bg-lime-400 text-black font-semibold"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                ทั้งหมด
              </button>
              {MUSCLE_GROUPS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setSelectedMuscle(m.value)}
                  className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                    selectedMuscle === m.value
                      ? "bg-lime-400 text-black font-semibold"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  }`}
                >
                  {m.label.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredExercises.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-sm space-y-3">
                <Dumbbell className="w-10 h-10 mx-auto stroke-[1.5] text-zinc-600" />
                <p>ไม่พบท่าออกกำลังกายที่ตรงกับการค้นหา</p>
                <button
                  onClick={() => setIsAddCustomOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-lime-400 text-black font-bold text-xs hover:bg-lime-300 transition"
                >
                  <Plus className="w-4 h-4" />
                  สร้างท่า &quot;{query || "ใหม่"}&quot; เองเลย
                </button>
              </div>
            ) : (
              filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => {
                    onSelect(ex);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-lime-400/50 hover:bg-lime-400/5 cursor-pointer transition group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white group-hover:text-lime-400 transition text-sm">
                        {ex.name}
                      </span>
                      {ex.isCustom ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          Custom
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-400">
                          Preset
                        </span>
                      )}
                    </div>
                    {ex.thaiName && (
                      <p className="text-xs text-zinc-400">{ex.thaiName}</p>
                    )}
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                      {ex.targetMuscle && <span>🎯 {ex.targetMuscle}</span>}
                      {ex.equipmentType && <span>⚙️ {ex.equipmentType}</span>}
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-zinc-800/60 text-zinc-400 group-hover:bg-lime-400 group-hover:text-black transition">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Embedded Custom Exercise Creator Modal */}
      <CustomExerciseModal
        isOpen={isAddCustomOpen}
        onClose={() => setIsAddCustomOpen(false)}
        onSuccess={() => {
          onRefreshExercises?.();
          setIsAddCustomOpen(false);
        }}
      />
    </>
  );
}
