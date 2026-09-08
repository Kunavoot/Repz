"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Zap,
  CheckSquare,
  Square,
  Dumbbell,
  Loader2,
  AlertCircle,
  Sparkles,
  Link2,
  Unlink,
} from "lucide-react";
import { SPLIT_CODES } from "@/lib/exercise-options";
import { ExercisePickerModal } from "./exercise-picker-modal";
import {
  createCustomRoutine,
  updateCustomRoutine,
  RoutineFormInput,
} from "@/actions/custom-routine";

interface ExerciseOption {
  id: string;
  name: string;
  thaiName: string | null;
  targetMuscle: string | null;
  equipmentType: string | null;
  isCustom: boolean;
}

interface RoutineBuilderProps {
  initialRoutine?: {
    id: string;
    name: string;
    description: string | null;
    isPreset?: boolean;
    workouts: Array<{
      id?: string;
      name: string;
      thaiName: string | null;
      splitCode: string;
      order: number;
      exercises: Array<{
        exerciseId: string;
        order: number;
        supersetGroupId: string | null;
        supersetName: string | null;
        targetSets: number;
        targetRepsMin: number;
        targetRepsMax: number;
        defaultWeight: number | null;
        notes: string | null;
        exercise: {
          id: string;
          name: string;
          thaiName: string | null;
          targetMuscle: string | null;
          equipmentType: string | null;
        };
      }>;
    }>;
  };
  allExercises: ExerciseOption[];
}

export function RoutineBuilder({ initialRoutine, allExercises: initialAllExercises }: RoutineBuilderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Routine general info
  const [routineName, setRoutineName] = useState(initialRoutine?.name || "");
  const [routineDescription, setRoutineDescription] = useState(initialRoutine?.description || "");

  // Exercise pool
  const [allExercisesList, setAllExercisesList] = useState<ExerciseOption[]>(initialAllExercises);

  // Workouts structure
  const [workouts, setWorkouts] = useState<
    Array<{
      id?: string;
      name: string;
      thaiName: string;
      splitCode: string;
      order: number;
      isExpanded: boolean;
      selectedExerciseIds: string[]; // for superset selection within day
      exercises: Array<{
        tempId: string; // unique key for react
        exerciseId: string;
        name: string;
        thaiName: string | null;
        targetMuscle: string | null;
        supersetGroupId: string | null;
        supersetName: string | null;
        targetSets: number;
        targetRepsMin: number;
        targetRepsMax: number;
        defaultWeight: number;
        notes: string;
      }>;
    }>
  >(() => {
    if (initialRoutine?.workouts && initialRoutine.workouts.length > 0) {
      return initialRoutine.workouts.map((w, idx) => ({
        id: w.id,
        name: w.name,
        thaiName: w.thaiName || "",
        splitCode: w.splitCode || "CUSTOM",
        order: w.order,
        isExpanded: idx === 0, // expand first day by default
        selectedExerciseIds: [],
        exercises: w.exercises.map((e, eIdx) => ({
          tempId: `ex-${Date.now()}-${idx}-${eIdx}`,
          exerciseId: e.exerciseId,
          name: e.exercise.name,
          thaiName: e.exercise.thaiName,
          targetMuscle: e.exercise.targetMuscle,
          supersetGroupId: e.supersetGroupId,
          supersetName: e.supersetName,
          targetSets: e.targetSets || 3,
          targetRepsMin: e.targetRepsMin || 10,
          targetRepsMax: e.targetRepsMax || 12,
          defaultWeight: e.defaultWeight ?? 0,
          notes: e.notes || "",
        })),
      }));
    }

    // Default template with 1 day
    return [
      {
        name: "Day 1",
        thaiName: "วันฝึกที่ 1",
        splitCode: "CUSTOM",
        order: 1,
        isExpanded: true,
        selectedExerciseIds: [],
        exercises: [],
      },
    ];
  });

  // State for opening exercise picker
  const [activePickerDayIndex, setActivePickerDayIndex] = useState<number | null>(null);

  // Toggle day accordion
  const toggleDayExpand = (dayIdx: number) => {
    setWorkouts((prev) =>
      prev.map((w, idx) => (idx === dayIdx ? { ...w, isExpanded: !w.isExpanded } : w))
    );
  };

  // Add new day
  const handleAddDay = () => {
    setWorkouts((prev) => [
      ...prev,
      {
        name: `Day ${prev.length + 1}`,
        thaiName: `วันฝึกที่ ${prev.length + 1}`,
        splitCode: "CUSTOM",
        order: prev.length + 1,
        isExpanded: true,
        selectedExerciseIds: [],
        exercises: [],
      },
    ]);
  };

  // Remove day
  const handleRemoveDay = (dayIdx: number) => {
    if (workouts.length <= 1) {
      setError("ต้องมีวันฝึกอย่างน้อย 1 วันในตาราง");
      return;
    }
    setWorkouts((prev) => prev.filter((_, idx) => idx !== dayIdx));
  };

  // Reorder day up/down
  const handleMoveDay = (dayIdx: number, direction: "up" | "down") => {
    if (
      (direction === "up" && dayIdx === 0) ||
      (direction === "down" && dayIdx === workouts.length - 1)
    ) {
      return;
    }
    const targetIdx = direction === "up" ? dayIdx - 1 : dayIdx + 1;
    const newWorkouts = [...workouts];
    const temp = newWorkouts[dayIdx];
    newWorkouts[dayIdx] = newWorkouts[targetIdx];
    newWorkouts[targetIdx] = temp;
    setWorkouts(newWorkouts);
  };

  // Add exercise to day
  const handleSelectExerciseForDay = (exercise: ExerciseOption) => {
    if (activePickerDayIndex === null) return;

    setWorkouts((prev) =>
      prev.map((w, idx) => {
        if (idx !== activePickerDayIndex) return w;
        return {
          ...w,
          exercises: [
            ...w.exercises,
            {
              tempId: `ex-${Date.now()}-${Math.random()}`,
              exerciseId: exercise.id,
              name: exercise.name,
              thaiName: exercise.thaiName,
              targetMuscle: exercise.targetMuscle,
              supersetGroupId: null,
              supersetName: null,
              targetSets: 3,
              targetRepsMin: 10,
              targetRepsMax: 12,
              defaultWeight: 0,
              notes: "",
            },
          ],
        };
      })
    );
  };

  // Remove exercise from day
  const handleRemoveExercise = (dayIdx: number, exerciseTempId: string) => {
    setWorkouts((prev) =>
      prev.map((w, idx) => {
        if (idx !== dayIdx) return w;
        return {
          ...w,
          selectedExerciseIds: w.selectedExerciseIds.filter((id) => id !== exerciseTempId),
          exercises: w.exercises.filter((e) => e.tempId !== exerciseTempId),
        };
      })
    );
  };

  // Move exercise up/down
  const handleMoveExercise = (dayIdx: number, exIdx: number, direction: "up" | "down") => {
    const day = workouts[dayIdx];
    if (
      (direction === "up" && exIdx === 0) ||
      (direction === "down" && exIdx === day.exercises.length - 1)
    ) {
      return;
    }
    const targetIdx = direction === "up" ? exIdx - 1 : exIdx + 1;
    const newExercises = [...day.exercises];
    const temp = newExercises[exIdx];
    newExercises[exIdx] = newExercises[targetIdx];
    newExercises[targetIdx] = temp;

    setWorkouts((prev) =>
      prev.map((w, idx) => (idx === dayIdx ? { ...w, exercises: newExercises } : w))
    );
  };

  // Superset selection toggle
  const handleToggleSelectExercise = (dayIdx: number, tempId: string) => {
    setWorkouts((prev) =>
      prev.map((w, idx) => {
        if (idx !== dayIdx) return w;
        const exists = w.selectedExerciseIds.includes(tempId);
        return {
          ...w,
          selectedExerciseIds: exists
            ? w.selectedExerciseIds.filter((id) => id !== tempId)
            : [...w.selectedExerciseIds, tempId],
        };
      })
    );
  };

  // Link selected exercises as Superset (Option 2: Select & Group)
  const handleLinkAsSuperset = (dayIdx: number) => {
    const day = workouts[dayIdx];
    if (day.selectedExerciseIds.length < 2) {
      return;
    }

    const groupId = `ss_${Date.now()}`;
    const selectedExercises = day.exercises.filter((e) =>
      day.selectedExerciseIds.includes(e.tempId)
    );
    const names = selectedExercises.map((e) => e.name).join(" + ");
    const supersetName = `⚡ Superset: ${names}`;

    setWorkouts((prev) =>
      prev.map((w, idx) => {
        if (idx !== dayIdx) return w;
        return {
          ...w,
          selectedExerciseIds: [], // clear selection
          exercises: w.exercises.map((e) => {
            if (w.selectedExerciseIds.includes(e.tempId)) {
              return {
                ...e,
                supersetGroupId: groupId,
                supersetName,
              };
            }
            return e;
          }),
        };
      })
    );
  };

  // Unlink an exercise from superset
  const handleUnlinkSuperset = (dayIdx: number, tempId: string) => {
    setWorkouts((prev) =>
      prev.map((w, idx) => {
        if (idx !== dayIdx) return w;
        const target = w.exercises.find((e) => e.tempId === tempId);
        if (!target?.supersetGroupId) return w;

        // If only 1 remains in this superset group after removal, unlink that one too
        const sameGroupCount = w.exercises.filter(
          (e) => e.supersetGroupId === target.supersetGroupId
        ).length;

        return {
          ...w,
          exercises: w.exercises.map((e) => {
            if (e.tempId === tempId) {
              return { ...e, supersetGroupId: null, supersetName: null };
            }
            if (sameGroupCount <= 2 && e.supersetGroupId === target.supersetGroupId) {
              return { ...e, supersetGroupId: null, supersetName: null };
            }
            return e;
          }),
        };
      })
    );
  };

  // Save routine form
  const handleSaveRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!routineName.trim()) {
      setError("กรุณากรอกชื่อตารางฝึก (Routine Name)");
      return;
    }

    if (workouts.length === 0) {
      setError("กรุณาเพิ่มวันฝึกอย่างน้อย 1 วัน");
      return;
    }

    for (let i = 0; i < workouts.length; i++) {
      if (workouts[i].exercises.length === 0) {
        setError(`วันฝึก "${workouts[i].name}" ยังไม่มีท่าออกกำลังกาย กรุณาเพิ่มท่าอย่างน้อย 1 ท่า`);
        return;
      }
    }

    const payload: RoutineFormInput = {
      name: routineName.trim(),
      description: routineDescription.trim() || null,
      workouts: workouts.map((w, wIdx) => ({
        name: w.name.trim() || `Day ${wIdx + 1}`,
        thaiName: w.thaiName.trim() || null,
        splitCode: w.splitCode,
        order: wIdx + 1,
        exercises: w.exercises.map((e, eIdx) => ({
          exerciseId: e.exerciseId,
          order: eIdx + 1,
          supersetGroupId: e.supersetGroupId,
          supersetName: e.supersetName,
          targetSets: Number(e.targetSets) || 3,
          targetRepsMin: Number(e.targetRepsMin) || 10,
          targetRepsMax: Number(e.targetRepsMax) || 12,
          defaultWeight: Number(e.defaultWeight) || 0,
          notes: e.notes.trim() || null,
        })),
      })),
    };

    startTransition(async () => {
      try {
        if (initialRoutine?.id && !initialRoutine.isPreset) {
          await updateCustomRoutine(initialRoutine.id, payload);
        } else {
          await createCustomRoutine(payload);
        }
        router.push("/routines");
        router.refresh();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึกตารางฝึก");
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-32 space-y-6">
      {/* Top Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              {initialRoutine
                ? initialRoutine.isPreset
                  ? "คัดลอกและปรับแต่งตาราง (Clone & Customize)"
                  : "แก้ไขตารางฝึก (Edit Routine)"
                : "สร้างตารางฝึกใหม่ (Routine Builder)"}
            </h1>
          </div>
          <p className="text-sm text-zinc-400">
            จัดวันฝึก เลือกท่าออกกำลังกาย กำหนดจำนวนเซ็ต/เรป และจับคู่ Superset ได้ตามต้องการ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 text-sm font-medium transition"
          >
            ย้อนกลับ
          </button>
          <button
            type="button"
            onClick={handleSaveRoutine}
            disabled={isPending}
            className="px-6 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-bold text-sm flex items-center gap-2 transition disabled:opacity-50 neon-glow-sm"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>บันทึกตารางฝึก</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-sm flex items-center gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Routine Metadata Card */}
      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
          ข้อมูลทั่วไปของโปรแกรม
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">
              ชื่อตารางฝึก <span className="text-lime-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. My 4-Day Push/Pull Split"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-lime-400/60 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">
              คำอธิบายเพิ่มเติม
            </label>
            <input
              type="text"
              placeholder="e.g. ตารางฝึกเน้นกล้ามอกและแขน เล่นสัปดาห์ละ 4 วัน"
              value={routineDescription}
              onChange={(e) => setRoutineDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-lime-400/60 transition"
            />
          </div>
        </div>
      </div>

      {/* Accordion List of Workout Days */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>วันฝึกในตาราง ({workouts.length} วัน)</span>
          </h2>
          <button
            type="button"
            onClick={handleAddDay}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-lime-400/10 border border-lime-400/30 text-lime-400 hover:bg-lime-400/20 text-xs font-bold transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ เพิ่มวันฝึก</span>
          </button>
        </div>

        {workouts.map((day, dayIdx) => {
          const selectedCount = day.selectedExerciseIds.length;

          return (
            <div
              key={`day-${dayIdx}`}
              className="rounded-2xl bg-zinc-900 border border-zinc-800/90 overflow-hidden transition"
            >
              {/* Day Header (Accordion trigger) */}
              <div
                onClick={() => toggleDayExpand(dayIdx)}
                className="flex items-center justify-between px-5 py-4 bg-zinc-950/60 hover:bg-zinc-950 cursor-pointer border-b border-zinc-800/80 transition select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-lime-400/10 text-lime-400 border border-lime-400/20 flex items-center justify-center font-bold text-xs">
                    {dayIdx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">
                        {day.name || `Day ${dayIdx + 1}`}
                      </span>
                      {day.thaiName && (
                        <span className="text-xs text-zinc-400">({day.thaiName})</span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500">
                      {day.exercises.length} ท่าออกกำลังกาย
                      {day.exercises.some((e) => e.supersetGroupId) && " • มี Superset ⚡"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    disabled={dayIdx === 0}
                    onClick={() => handleMoveDay(dayIdx, "up")}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-20 transition"
                    title="เลื่อนขึ้น"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={dayIdx === workouts.length - 1}
                    onClick={() => handleMoveDay(dayIdx, "down")}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-20 transition"
                    title="เลื่อนลง"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveDay(dayIdx)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/40 transition ml-1"
                    title="ลบวันนี้"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div
                    onClick={() => toggleDayExpand(dayIdx)}
                    className="p-1.5 text-zinc-400 ml-1 cursor-pointer"
                  >
                    {day.isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-zinc-300" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-zinc-300" />
                    )}
                  </div>
                </div>
              </div>

              {/* Day Body (Expanded) */}
              {day.isExpanded && (
                <div className="p-5 space-y-5">
                  {/* Day Info Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-800/60">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                        ชื่อวันฝึก (English)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Push Day"
                        value={day.name}
                        onChange={(e) =>
                          setWorkouts((prev) =>
                            prev.map((w, i) => (i === dayIdx ? { ...w, name: e.target.value } : w))
                          )
                        }
                        className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-lime-400/60"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                        คำบรรยายภาษาไทย
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. วันจันทร์: อก, ไหล่, หลังแขน"
                        value={day.thaiName}
                        onChange={(e) =>
                          setWorkouts((prev) =>
                            prev.map((w, i) =>
                              i === dayIdx ? { ...w, thaiName: e.target.value } : w
                            )
                          )
                        }
                        className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-lime-400/60"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                        ประเภทสปลิท (Split Code)
                      </label>
                      <select
                        value={day.splitCode}
                        onChange={(e) =>
                          setWorkouts((prev) =>
                            prev.map((w, i) =>
                              i === dayIdx ? { ...w, splitCode: e.target.value } : w
                            )
                          )
                        }
                        className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-lime-400/60"
                      >
                        {SPLIT_CODES.map((s) => (
                          <option key={s.code} value={s.code} className="bg-zinc-900 text-white">
                            {s.thaiName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Superset Pairing Selection Bar (appears when 2+ items selected) */}
                  {selectedCount >= 2 && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-lime-400/10 border border-lime-400/40 text-lime-300 animate-fade-in">
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <Zap className="w-4 h-4 text-lime-400 fill-lime-400" />
                        <span>เลือกไว้ {selectedCount} ท่า</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleLinkAsSuperset(dayIdx)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lime-400 text-black font-bold text-xs hover:bg-lime-300 transition"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>จับคู่เป็น Superset ⚡</span>
                      </button>
                    </div>
                  )}

                  {/* Exercise List for Day */}
                  <div className="space-y-3">
                    {day.exercises.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-zinc-800 rounded-xl space-y-2">
                        <Dumbbell className="w-8 h-8 mx-auto text-zinc-600 stroke-[1.5]" />
                        <p className="text-xs text-zinc-500">ยังไม่มีท่าออกกำลังกายในวันนี้</p>
                        <button
                          type="button"
                          onClick={() => setActivePickerDayIndex(dayIdx)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium transition"
                        >
                          <Plus className="w-3.5 h-3.5 text-lime-400" />
                          <span>เพิ่มท่าออกกำลังกาย</span>
                        </button>
                      </div>
                    ) : (
                      day.exercises.map((ex, exIdx) => {
                        const isSelected = day.selectedExerciseIds.includes(ex.tempId);
                        const isInSuperset = !!ex.supersetGroupId;

                        return (
                          <div
                            key={ex.tempId}
                            className={`p-4 rounded-xl border transition ${
                              isInSuperset
                                ? "bg-zinc-950/80 border-lime-500/40 shadow-sm"
                                : "bg-zinc-950/50 border-zinc-800"
                            }`}
                          >
                            {/* Superset indicator banner */}
                            {isInSuperset && (
                              <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/60 text-[11px] text-lime-400 font-bold">
                                <span className="flex items-center gap-1">
                                  <Zap className="w-3 h-3 fill-lime-400" />
                                  {ex.supersetName || "Superset Group"}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUnlinkSuperset(dayIdx, ex.tempId)}
                                  className="flex items-center gap-1 text-zinc-400 hover:text-red-400 transition"
                                  title="ยกเลิกการจับคู่"
                                >
                                  <Unlink className="w-3 h-3" />
                                  <span>แยกเดี่ยว</span>
                                </button>
                              </div>
                            )}

                            {/* Row Header: Checkbox + Name + Reorder/Delete */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                {/* Checkbox for superset grouping */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleSelectExercise(dayIdx, ex.tempId)}
                                  className="mt-0.5 text-zinc-500 hover:text-lime-400 transition"
                                  title="ติ๊กเพื่อจับคู่ Superset"
                                >
                                  {isSelected ? (
                                    <CheckSquare className="w-4 h-4 text-lime-400" />
                                  ) : (
                                    <Square className="w-4 h-4" />
                                  )}
                                </button>

                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-zinc-400">
                                      #{exIdx + 1}
                                    </span>
                                    <h4 className="text-sm font-bold text-white">{ex.name}</h4>
                                  </div>
                                  {ex.thaiName && (
                                    <p className="text-xs text-zinc-400">{ex.thaiName}</p>
                                  )}
                                  {ex.targetMuscle && (
                                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300">
                                      {ex.targetMuscle}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={exIdx === 0}
                                  onClick={() => handleMoveExercise(dayIdx, exIdx, "up")}
                                  className="p-1 rounded text-zinc-500 hover:text-white disabled:opacity-20 transition"
                                  title="เลื่อนขึ้น"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={exIdx === day.exercises.length - 1}
                                  onClick={() => handleMoveExercise(dayIdx, exIdx, "down")}
                                  className="p-1 rounded text-zinc-500 hover:text-white disabled:opacity-20 transition"
                                  title="เลื่อนลง"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveExercise(dayIdx, ex.tempId)}
                                  className="p-1 rounded text-zinc-500 hover:text-red-400 transition ml-1"
                                  title="ลบท่านี้"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Sets & Reps Inputs */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-zinc-800/60">
                              <div>
                                <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">
                                  จำนวนเซ็ต (Sets)
                                </label>
                                <input
                                  type="number"
                                  min={1}
                                  max={10}
                                  value={ex.targetSets}
                                  onChange={(e) =>
                                    setWorkouts((prev) =>
                                      prev.map((w, i) =>
                                        i === dayIdx
                                          ? {
                                              ...w,
                                              exercises: w.exercises.map((item) =>
                                                item.tempId === ex.tempId
                                                  ? { ...item, targetSets: Number(e.target.value) }
                                                  : item
                                              ),
                                            }
                                          : w
                                      )
                                    )
                                  }
                                  className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-lime-400/60"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">
                                  เรปขั้นต่ำ (Min Reps)
                                </label>
                                <input
                                  type="number"
                                  min={1}
                                  max={100}
                                  value={ex.targetRepsMin}
                                  onChange={(e) =>
                                    setWorkouts((prev) =>
                                      prev.map((w, i) =>
                                        i === dayIdx
                                          ? {
                                              ...w,
                                              exercises: w.exercises.map((item) =>
                                                item.tempId === ex.tempId
                                                  ? {
                                                      ...item,
                                                      targetRepsMin: Number(e.target.value),
                                                    }
                                                  : item
                                              ),
                                            }
                                          : w
                                      )
                                    )
                                  }
                                  className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-lime-400/60"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">
                                  เรปสูงสุด (Max Reps)
                                </label>
                                <input
                                  type="number"
                                  min={1}
                                  max={100}
                                  value={ex.targetRepsMax}
                                  onChange={(e) =>
                                    setWorkouts((prev) =>
                                      prev.map((w, i) =>
                                        i === dayIdx
                                          ? {
                                              ...w,
                                              exercises: w.exercises.map((item) =>
                                                item.tempId === ex.tempId
                                                  ? {
                                                      ...item,
                                                      targetRepsMax: Number(e.target.value),
                                                    }
                                                  : item
                                              ),
                                            }
                                          : w
                                      )
                                    )
                                  }
                                  className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-lime-400/60"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-semibold text-zinc-400 uppercase mb-1">
                                  น้ำหนักเริ่มต้น (kg)
                                </label>
                                <input
                                  type="number"
                                  step="0.5"
                                  min={0}
                                  value={ex.defaultWeight}
                                  onChange={(e) =>
                                    setWorkouts((prev) =>
                                      prev.map((w, i) =>
                                        i === dayIdx
                                          ? {
                                              ...w,
                                              exercises: w.exercises.map((item) =>
                                                item.tempId === ex.tempId
                                                  ? {
                                                      ...item,
                                                      defaultWeight: Number(e.target.value),
                                                    }
                                                  : item
                                              ),
                                            }
                                          : w
                                      )
                                    )
                                  }
                                  className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-lime-400/60"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Add Exercise Button */}
                  <button
                    type="button"
                    onClick={() => setActivePickerDayIndex(dayIdx)}
                    className="w-full py-2.5 border border-dashed border-zinc-700 hover:border-lime-400/60 rounded-xl text-zinc-400 hover:text-lime-400 text-xs font-bold flex items-center justify-center gap-2 transition bg-zinc-950/30"
                  >
                    <Plus className="w-4 h-4" />
                    <span>เพิ่มท่าออกกำลังกายใน {day.name || `Day ${dayIdx + 1}`}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Exercise Picker Modal */}
      <ExercisePickerModal
        isOpen={activePickerDayIndex !== null}
        onClose={() => setActivePickerDayIndex(null)}
        exercises={allExercisesList}
        onSelect={handleSelectExerciseForDay}
        onRefreshExercises={async () => {
          // Refresh list if user created new custom exercise
          const res = await fetch("/api/exercises");
          if (res.ok) {
            const data = await res.json();
            setAllExercisesList(data);
          }
        }}
      />
    </div>
  );
}
