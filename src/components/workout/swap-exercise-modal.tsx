"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Search, Dumbbell, Target, Check, ArrowRightLeft, Loader2 } from "lucide-react";
import { getAllExercises } from "@/actions/workout";

interface ExerciseItem {
  id: string;
  name: string;
  thaiName: string | null;
  targetMuscle: string | null;
  equipmentType: string | null;
  weightInstruction: string | null;
  notes: string | null;
}

interface SwapExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentExerciseId: string;
  currentExerciseName: string;
  currentTargetMuscle: string | null;
  onConfirmSwap: (newExerciseId: string) => Promise<void>;
}

export function SwapExerciseModal({
  isOpen,
  onClose,
  currentExerciseId,
  currentExerciseName,
  currentTargetMuscle,
  onConfirmSwap,
}: SwapExerciseModalProps) {
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSameMuscleOnly, setFilterSameMuscleOnly] = useState(true);

  // Fetch exercises when modal opens
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setLoading(true);
    setSearchQuery("");
    setFilterSameMuscleOnly(Boolean(currentTargetMuscle));

    getAllExercises()
      .then((data) => {
        if (isMounted) {
          setExercises(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load exercises:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, currentTargetMuscle]);

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      // Exclude current exercise
      if (ex.id === currentExerciseId) return false;

      // Filter by muscle if toggled
      if (filterSameMuscleOnly && currentTargetMuscle) {
        if (ex.targetMuscle?.toLowerCase() !== currentTargetMuscle.toLowerCase()) {
          return false;
        }
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = ex.name.toLowerCase().includes(q);
        const matchThai = ex.thaiName ? ex.thaiName.toLowerCase().includes(q) : false;
        const matchMuscle = ex.targetMuscle ? ex.targetMuscle.toLowerCase().includes(q) : false;
        return matchName || matchThai || matchMuscle;
      }

      return true;
    });
  }, [exercises, currentExerciseId, filterSameMuscleOnly, currentTargetMuscle, searchQuery]);

  const handleSelect = async (exerciseId: string) => {
    if (submittingId) return;
    setSubmittingId(exerciseId);
    try {
      await onConfirmSwap(exerciseId);
      onClose();
    } catch (error) {
      console.error("Failed to swap exercise:", error);
      alert(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการเปลี่ยนท่า");
    } finally {
      setSubmittingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-lime-400/10 border border-lime-500/20 flex items-center justify-center text-lime-400">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                เปลี่ยนท่าออกกำลังกาย (Swap)
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                แทนที่ <span className="text-lime-400 font-medium">"{currentExerciseName}"</span> ในเซสชันนี้
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-4 border-b border-zinc-800/80 space-y-3 bg-zinc-900/50">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อท่า, ชื่อไทย หรือกล้ามเนื้อ..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-950/80 border border-zinc-700/60 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Muscle filter pills */}
          {currentTargetMuscle && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterSameMuscleOnly(true)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
                  filterSameMuscleOnly
                    ? "bg-lime-500/20 text-lime-300 border-lime-500/40 font-semibold"
                    : "bg-zinc-800/50 text-zinc-400 border-zinc-700/50 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
              >
                <Target className="w-3 h-3" />
                เฉพาะกลุ่ม {currentTargetMuscle}
              </button>
              <button
                type="button"
                onClick={() => setFilterSameMuscleOnly(false)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                  !filterSameMuscleOnly
                    ? "bg-lime-500/20 text-lime-300 border-lime-500/40 font-semibold"
                    : "bg-zinc-800/50 text-zinc-400 border-zinc-700/50 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
              >
                แสดงทั้งหมด ({exercises.length - (exercises.some((e) => e.id === currentExerciseId) ? 1 : 0)})
              </button>
            </div>
          )}
        </div>

        {/* Exercises List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-zinc-800/40">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-zinc-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-lime-400" />
              <span className="text-xs">กำลังโหลดรายชื่อท่า...</span>
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs">
              ไม่พบท่าออกกำลังกายที่ตรงกับเงื่อนไข
              {filterSameMuscleOnly && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setFilterSameMuscleOnly(false)}
                    className="text-lime-400 hover:underline font-medium"
                  >
                    ลองดูท่าออกกำลังกายทั้งหมด
                  </button>
                </div>
              )}
            </div>
          ) : (
            filteredExercises.map((ex) => {
              const isSubmitting = submittingId === ex.id;

              return (
                <div
                  key={ex.id}
                  className="pt-2 first:pt-0"
                >
                  <button
                    type="button"
                    disabled={Boolean(submittingId)}
                    onClick={() => handleSelect(ex.id)}
                    className="w-full text-left p-3 rounded-2xl hover:bg-zinc-800/70 active:bg-zinc-800 border border-transparent hover:border-zinc-700/60 transition group flex items-center justify-between gap-3 disabled:opacity-50"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white group-hover:text-lime-400 transition truncate">
                          {ex.thaiName || ex.name}
                        </span>
                        {ex.thaiName && (
                          <span className="text-xs text-zinc-400 truncate">
                            ({ex.name})
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        {ex.targetMuscle && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                            <Target className="w-2.5 h-2.5 text-lime-400" />
                            {ex.targetMuscle}
                          </span>
                        )}
                        {ex.equipmentType && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800/60 text-zinc-400">
                            <Dumbbell className="w-2.5 h-2.5" />
                            {ex.equipmentType}
                          </span>
                        )}
                        {ex.weightInstruction && (
                          <span className="text-zinc-500">
                            • {ex.weightInstruction}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-800 group-hover:bg-lime-400 group-hover:text-black text-zinc-400 transition">
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin text-lime-400" />
                      ) : (
                        <Check className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                      )}
                    </div>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-zinc-950/60 border-t border-zinc-800 text-center text-[11px] text-zinc-500">
          💡 การสลับท่าจะมีผลเฉพาะเซสชันนี้เท่านั้น จะไม่กระทบกับ Routine ดั้งเดิม
        </div>
      </div>
    </div>
  );
}
