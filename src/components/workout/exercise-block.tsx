"use client";

import React, { useState } from "react";
import { Plus, ChevronDown, ChevronUp, Sparkles, Target, Dumbbell } from "lucide-react";
import { SetRow } from "./set-row";

interface ExerciseBlockProps {
  workoutExercise: {
    id: string;
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
      weightInstruction: string | null;
      notes: string | null;
    };
  };
  setLogs: Array<{
    id: string;
    exerciseId: string;
    setNumber: number;
    reps: number;
    weight: number;
    completed: boolean;
  }>;
  onSetCompleted: () => void;
  onAddSet: (exerciseId: string) => void;
  onDeleteSet: (setLogId: string) => void;
}

export function ExerciseBlock({
  workoutExercise,
  setLogs,
  onSetCompleted,
  onAddSet,
  onDeleteSet,
}: ExerciseBlockProps) {
  const [showTips, setShowTips] = useState(false);
  const { exercise } = workoutExercise;

  const completedCount = setLogs.filter((s) => s.completed).length;
  const isAllDone = setLogs.length > 0 && completedCount === setLogs.length;

  return (
    <div className={`p-4 rounded-2xl border transition-all ${
      isAllDone
        ? "bg-zinc-900/60 border-lime-500/30"
        : "bg-zinc-900/90 border-zinc-800 shadow-md"
    }`}>
      {/* Exercise Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h4 className="text-base font-bold text-white tracking-tight">
              {exercise.thaiName || exercise.name}
            </h4>
            {exercise.thaiName && (
              <span className="text-xs text-zinc-400 font-medium">
                ({exercise.name})
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {exercise.targetMuscle && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                <Target className="w-3 h-3 text-lime-400" />
                {exercise.targetMuscle}
              </span>
            )}
            {exercise.weightInstruction && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-lime-950/40 text-lime-300 border border-lime-500/30">
                <Dumbbell className="w-3 h-3 text-lime-400" />
                {exercise.weightInstruction}
              </span>
            )}
            <span className="px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-400 font-mono text-[11px]">
              {completedCount}/{setLogs.length} เซ็ต
            </span>
          </div>
        </div>

        {/* Tips toggle */}
        {(exercise.notes || workoutExercise.notes) && (
          <button
            type="button"
            onClick={() => setShowTips(!showTips)}
            className="p-1.5 text-xs text-lime-400 hover:bg-lime-400/10 rounded-lg border border-lime-400/20 flex items-center gap-1 transition shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">วิธีเล่น & โฟกัส</span>
            {showTips ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Form Cues & Notes */}
      {showTips && (exercise.notes || workoutExercise.notes) && (
        <div className="mb-4 p-3 rounded-xl bg-lime-950/20 border border-lime-500/30 text-xs text-lime-200/90 leading-relaxed animate-in fade-in">
          <p className="font-semibold text-lime-300 mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-lime-400" />
            คำแนะนำสำหรับผู้เริ่มต้น:
          </p>
          <p>{exercise.notes || workoutExercise.notes}</p>
        </div>
      )}

      {/* Sets List */}
      <div className="space-y-2 mb-3">
        {setLogs.map((setLog) => (
          <SetRow
            key={setLog.id}
            setLog={setLog}
            exercise={exercise}
            targetRepsMin={workoutExercise.targetRepsMin}
            targetRepsMax={workoutExercise.targetRepsMax}
            onSetCompleted={onSetCompleted}
            onDeleteSet={onDeleteSet}
          />
        ))}
      </div>

      {/* Add Set Button */}
      <button
        type="button"
        onClick={() => onAddSet(exercise.id)}
        className="w-full py-2 px-3 rounded-xl bg-zinc-950/60 hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-dashed border-zinc-700/80 hover:border-zinc-500 text-xs font-medium flex items-center justify-center gap-1.5 transition"
      >
        <Plus className="w-3.5 h-3.5" />
        เพิ่มเซ็ต
      </button>
    </div>
  );
}
