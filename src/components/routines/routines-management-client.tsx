"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Layers,
  Dumbbell,
  Plus,
  CheckCircle2,
  Copy,
  Edit2,
  Trash2,
  Zap,
  Search,
  AlertCircle,
} from "lucide-react";
import { MUSCLE_GROUPS, EQUIPMENT_TYPES } from "@/lib/exercise-options";
import { CustomExerciseModal } from "./custom-exercise-modal";
import {
  setActiveRoutine,
  cloneRoutine,
  deleteCustomRoutine,
  deleteCustomExercise,
} from "@/actions/custom-routine";

interface ExerciseItem {
  id: string;
  name: string;
  thaiName: string | null;
  targetMuscle: string | null;
  equipmentType: string | null;
  isUnilateral: boolean;
  weightInstruction: string | null;
  notes: string | null;
  isCustom: boolean;
}

interface RoutineItem {
  id: string;
  name: string;
  description: string | null;
  isPreset: boolean;
  isCustom: boolean;
  isActive: boolean;
  workouts: Array<{
    id: string;
    name: string;
    thaiName: string | null;
    splitCode: string;
    order: number;
    exercises: Array<{
      id: string;
      order: number;
      supersetGroupId: string | null;
      exercise: {
        id: string;
        name: string;
        thaiName: string | null;
      };
    }>;
  }>;
}

interface RoutinesManagementClientProps {
  initialRoutines: RoutineItem[];
  initialExercises: ExerciseItem[];
  activeRoutineId: string | null;
}

export function RoutinesManagementClient({
  initialRoutines,
  initialExercises,
  activeRoutineId,
}: RoutinesManagementClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"routines" | "exercises">("routines");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  // Exercise tab state
  const [exerciseQuery, setExerciseQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState<string>("ALL");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("ALL");
  const [editingExercise, setEditingExercise] = useState<ExerciseItem | null>(null);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);

  // Filtered exercises
  const filteredExercises = initialExercises.filter((ex) => {
    const q = exerciseQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      ex.name.toLowerCase().includes(q) ||
      (ex.thaiName && ex.thaiName.toLowerCase().includes(q)) ||
      (ex.targetMuscle && ex.targetMuscle.toLowerCase().includes(q));

    const matchMuscle =
      selectedMuscle === "ALL" ||
      (ex.targetMuscle && ex.targetMuscle.toLowerCase().includes(selectedMuscle.toLowerCase()));

    const matchEquipment =
      selectedEquipment === "ALL" ||
      (ex.equipmentType && ex.equipmentType.toLowerCase() === selectedEquipment.toLowerCase());

    return matchQuery && matchMuscle && matchEquipment;
  });

  // Handle setting active routine
  const handleSetActive = (routineId: string) => {
    setFeedback(null);
    startTransition(async () => {
      try {
        await setActiveRoutine(routineId);
        setFeedback({ type: "success", message: "เปลี่ยนตารางฝึกหลักเรียบร้อยแล้ว" });
        router.refresh();
      } catch (err: unknown) {
        setFeedback({
          type: "error",
          message: err instanceof Error ? err.message : "เกิดข้อผิดพลาด",
        });
      }
    });
  };

  // Handle clone routine
  const handleClone = (routineId: string) => {
    setFeedback(null);
    startTransition(async () => {
      try {
        const res = await cloneRoutine(routineId);
        setFeedback({ type: "success", message: "คัดลอกตารางฝึกสำเร็จแล้ว" });
        router.push(`/routines/${res.routineId}/edit`);
      } catch (err: unknown) {
        setFeedback({
          type: "error",
          message: err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการคัดลอก",
        });
      }
    });
  };

  // Handle delete custom routine
  const handleDeleteRoutine = (routineId: string, name: string) => {
    if (!confirm(`คุณต้องการลบตารางฝึก "${name}" หรือไม่?`)) return;

    setFeedback(null);
    startTransition(async () => {
      try {
        await deleteCustomRoutine(routineId);
        setFeedback({ type: "success", message: "ลบตารางฝึกเรียบร้อยแล้ว" });
        router.refresh();
      } catch (err: unknown) {
        setFeedback({
          type: "error",
          message: err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการลบ",
        });
      }
    });
  };

  // Handle delete custom exercise
  const handleDeleteExercise = (exerciseId: string, name: string) => {
    if (!confirm(`คุณต้องการลบท่าออกกำลังกาย "${name}" หรือไม่?`)) return;

    setFeedback(null);
    startTransition(async () => {
      try {
        await deleteCustomExercise(exerciseId);
        setFeedback({ type: "success", message: "ลบท่าออกกำลังกายเรียบร้อยแล้ว" });
        router.refresh();
      } catch (err: unknown) {
        setFeedback({
          type: "error",
          message: err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการลบ",
        });
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              จัดการตารางฝึก & ท่าออกกำลังกาย
            </h1>
          </div>
          <p className="text-sm text-zinc-400">
            ปรับแต่ง Routine ของคุณเอง หรือเพิ่มท่าใหม่อิสระตามอุปกรณ์ที่คุณมี
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "routines" ? (
            <Link
              href="/routines/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-bold text-sm transition neon-glow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>สร้างตารางฝึกใหม่</span>
            </Link>
          ) : (
            <button
              onClick={() => {
                setEditingExercise(null);
                setIsExerciseModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-bold text-sm transition neon-glow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มท่าใหม่</span>
            </button>
          )}
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-3 animate-fade-in ${
            feedback.type === "success"
              ? "bg-lime-400/10 border border-lime-400/40 text-lime-300"
              : "bg-red-950/60 border border-red-500/40 text-red-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-lime-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Tabs (Routines vs Exercises) */}
      <div className="flex items-center gap-2 p-1.5 bg-zinc-900 border border-zinc-800/80 rounded-2xl">
        <button
          onClick={() => setActiveTab("routines")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition ${
            activeTab === "routines"
              ? "bg-zinc-800 text-white shadow-md border border-zinc-700/60"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4 text-lime-400" />
          <span>ตารางฝึกซ้อม ({initialRoutines.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("exercises")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition ${
            activeTab === "exercises"
              ? "bg-zinc-800 text-white shadow-md border border-zinc-700/60"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Dumbbell className="w-4 h-4 text-lime-400" />
          <span>คลังท่าออกกำลังกาย ({initialExercises.length})</span>
        </button>
      </div>

      {/* -------------------------------------------------------- */}
      {/* TAB 1: ROUTINES LIST */}
      {/* -------------------------------------------------------- */}
      {activeTab === "routines" && (
        <div className="space-y-4">
          {initialRoutines.map((routine) => {
            const isCurrentlyActive = routine.id === activeRoutineId;
            const totalExercises = routine.workouts.reduce(
              (acc, w) => acc + w.exercises.length,
              0
            );
            const hasSuperset = routine.workouts.some((w) =>
              w.exercises.some((e) => e.supersetGroupId)
            );

            return (
              <div
                key={routine.id}
                className={`p-5 rounded-2xl border transition ${
                  isCurrentlyActive
                    ? "bg-gradient-to-br from-zinc-900 to-zinc-950 border-lime-400/50 shadow-lg neon-glow-sm"
                    : "bg-zinc-900 border-zinc-800/90 hover:border-zinc-700"
                }`}
              >
                {/* Header: Title + Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        {routine.name}
                      </h3>
                      {isCurrentlyActive && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-lime-400 text-black flex items-center gap-1 shadow-sm">
                          <CheckCircle2 className="w-3 h-3" />
                          กำลังใช้งาน
                        </span>
                      )}
                      {routine.isPreset ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                          Preset ของระบบ
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          ตารางส่วนตัว
                        </span>
                      )}
                      {hasSuperset && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-lime-400/10 text-lime-400 border border-lime-400/20 flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5 fill-lime-400" />
                          Superset
                        </span>
                      )}
                    </div>
                    {routine.description && (
                      <p className="text-xs text-zinc-400 line-clamp-2">{routine.description}</p>
                    )}
                  </div>

                  {/* Top Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!isCurrentlyActive && (
                      <button
                        onClick={() => handleSetActive(routine.id)}
                        disabled={isPending}
                        className="px-3.5 py-1.5 rounded-xl bg-lime-400/10 hover:bg-lime-400/20 border border-lime-400/30 text-lime-400 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>เลือกใช้ตารางนี้</span>
                      </button>
                    )}

                    {routine.isPreset ? (
                      <button
                        onClick={() => handleClone(routine.id)}
                        disabled={isPending}
                        className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium transition flex items-center gap-1.5 disabled:opacity-50"
                        title="สร้างสำเนาตารางนี้เพื่อแก้ไขเป็นของตัวเอง"
                      >
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                        <span>คัดลอกมาปรับแต่ง</span>
                      </button>
                    ) : (
                      <>
                        <Link
                          href={`/routines/${routine.id}/edit`}
                          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium transition flex items-center gap-1.5"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                          <span>แก้ไข</span>
                        </Link>
                        <button
                          onClick={() => handleDeleteRoutine(routine.id, routine.name)}
                          disabled={isPending}
                          className="p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-950/30 transition disabled:opacity-50"
                          title="ลบตารางฝึกนี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Workout Days List Preview */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
                    <span>ตารางย่อย ({routine.workouts.length} วัน • {totalExercises} ท่า)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {routine.workouts.map((w) => (
                      <div
                        key={w.id}
                        className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white text-xs">
                            {w.name}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {w.exercises.length} ท่า
                          </span>
                        </div>
                        {w.thaiName && (
                          <p className="text-[11px] text-zinc-400 truncate">{w.thaiName}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* TAB 2: EXERCISES LIST */}
      {/* -------------------------------------------------------- */}
      {activeTab === "exercises" && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อท่าภาษาอังกฤษหรือไทย..."
                value={exerciseQuery}
                onChange={(e) => setExerciseQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400/60 transition"
              />
            </div>

            {/* Muscle Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              <button
                onClick={() => setSelectedMuscle("ALL")}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedMuscle === "ALL"
                    ? "bg-lime-400 text-black font-semibold"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                ทุกกลุ่มกล้ามเนื้อ
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

            {/* Equipment Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs border-t border-zinc-800/60 pt-2">
              <button
                onClick={() => setSelectedEquipment("ALL")}
                className={`px-2.5 py-0.5 rounded-md font-medium whitespace-nowrap text-[11px] transition ${
                  selectedEquipment === "ALL"
                    ? "bg-zinc-200 text-black font-semibold"
                    : "bg-zinc-800/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
              >
                ทุกอุปกรณ์
              </button>
              {EQUIPMENT_TYPES.map((eq) => (
                <button
                  key={eq.value}
                  onClick={() => setSelectedEquipment(eq.value)}
                  className={`px-2.5 py-0.5 rounded-md font-medium whitespace-nowrap text-[11px] transition ${
                    selectedEquipment === eq.value
                      ? "bg-zinc-200 text-black font-semibold"
                      : "bg-zinc-800/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  {eq.label.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Exercises Count and List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredExercises.length === 0 ? (
              <div className="col-span-full text-center py-12 text-zinc-500 text-sm space-y-3">
                <Dumbbell className="w-10 h-10 mx-auto stroke-[1.5] text-zinc-600" />
                <p>ไม่พบท่าออกกำลังกายที่ตรงกับตัวกรอง</p>
                <button
                  onClick={() => {
                    setEditingExercise(null);
                    setIsExerciseModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-lime-400 text-black font-bold text-xs hover:bg-lime-300 transition"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่มท่าใหม่
                </button>
              </div>
            ) : (
              filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  className="p-4 rounded-xl bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 transition flex items-start justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">{ex.name}</span>
                      {ex.isCustom ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          Custom
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-400">
                          Preset
                        </span>
                      )}
                      {ex.isUnilateral && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-950/60 text-blue-400 border border-blue-500/30">
                          เล่นทีละข้าง
                        </span>
                      )}
                    </div>

                    {ex.thaiName && (
                      <p className="text-xs text-zinc-400">{ex.thaiName}</p>
                    )}

                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 flex-wrap pt-0.5">
                      {ex.targetMuscle && (
                        <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800">
                          🎯 {ex.targetMuscle}
                        </span>
                      )}
                      {ex.equipmentType && (
                        <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800">
                          ⚙️ {ex.equipmentType}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions for Custom Exercise */}
                  {ex.isCustom && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingExercise(ex);
                          setIsExerciseModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                        title="แก้ไขท่านี้"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteExercise(ex.id, ex.name)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/30 transition"
                        title="ลบท่านี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal for Creating / Editing Custom Exercise */}
      <CustomExerciseModal
        isOpen={isExerciseModalOpen}
        onClose={() => {
          setIsExerciseModalOpen(false);
          setEditingExercise(null);
        }}
        initialData={editingExercise}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
