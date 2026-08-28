"use client";

import React from "react";
import { Zap, ArrowDown } from "lucide-react";
import { ExerciseBlock } from "./exercise-block";

interface SupersetCardProps {
  groupId: string;
  groupName: string;
  workoutExercises: Array<{
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
  }>;
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

export function SupersetCard({
  groupName,
  workoutExercises,
  setLogs,
  onSetCompleted,
  onAddSet,
  onDeleteSet,
}: SupersetCardProps) {
  const isSuperset = workoutExercises.length > 1;

  return (
    <div className="relative p-4 sm:p-5 rounded-3xl bg-zinc-950/80 border border-zinc-800 shadow-xl overflow-hidden">
      {/* Accent highlight */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-lime-400 via-emerald-400 to-transparent" />

      {/* Superset Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-lime-400/10 text-lime-400 border border-lime-400/30">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              {groupName}
            </h3>
            {isSuperset && (
              <p className="text-[11px] text-zinc-400">
                เล่นคู่กันโดยไม่พักระหว่างท่า → จบทั้งสองท่า พัก 60-90 วิ
              </p>
            )}
          </div>
        </div>

        {isSuperset && (
          <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-lime-400/20 text-lime-400 border border-lime-400/30 tracking-wider">
            Superset Pair
          </span>
        )}
      </div>

      {/* Exercises List */}
      <div className="space-y-4">
        {workoutExercises.map((we, index) => {
          const exerciseSets = setLogs.filter((s) => s.exerciseId === we.exercise.id);
          const isLast = index === workoutExercises.length - 1;

          return (
            <div key={we.id} className="space-y-3">
              <ExerciseBlock
                workoutExercise={we}
                setLogs={exerciseSets}
                onSetCompleted={onSetCompleted}
                onAddSet={onAddSet}
                onDeleteSet={onDeleteSet}
              />

              {/* Superset connector arrow */}
              {!isLast && isSuperset && (
                <div className="flex items-center justify-center gap-2 py-1 text-xs text-lime-400 font-semibold">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-lime-500/30 to-transparent" />
                  <span className="flex items-center gap-1 bg-zinc-900 px-3 py-1 rounded-full border border-lime-400/30 text-[11px]">
                    <ArrowDown className="w-3 h-3 animate-bounce" />
                    ต่อด้วยท่าด้านล่างทันที
                  </span>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-lime-500/30 to-transparent" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
