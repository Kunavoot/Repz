"use client";

import React, { useState, useTransition } from "react";
import { Check, Trash2, Plus, Minus, Info } from "lucide-react";
import { updateSetLog, deleteSetLog } from "@/actions/workout";
import { getDumbbellSetup } from "@/lib/dumbbell-data";

interface SetRowProps {
  setLog: {
    id: string;
    setNumber: number;
    reps: number;
    weight: number;
    completed: boolean;
  };
  exercise: {
    equipmentType: string | null;
    weightInstruction: string | null;
  };
  targetRepsMin: number;
  targetRepsMax: number;
  onSetCompleted: () => void;
  onDeleteSet: (setLogId: string) => void;
}

export function SetRow({
  setLog,
  exercise,
  targetRepsMin,
  targetRepsMax,
  onSetCompleted,
  onDeleteSet,
}: SetRowProps) {
  const [isPending, startTransition] = useTransition();
  const [reps, setReps] = useState(setLog.reps);
  const [weight, setWeight] = useState(setLog.weight);
  const [completed, setCompleted] = useState(setLog.completed);
  const [showPlateGuide, setShowPlateGuide] = useState(false);

  const isBodyweight = exercise.equipmentType === "bodyweight" && weight === 0;
  const plateSetup = getDumbbellSetup(weight);

  const handleToggleComplete = () => {
    const nextCompleted = !completed;
    setCompleted(nextCompleted);

    startTransition(async () => {
      await updateSetLog(setLog.id, {
        reps,
        weight,
        completed: nextCompleted,
      });
    });

    if (nextCompleted) {
      onSetCompleted();
    }
  };

  const handleWeightChange = (newWeight: number) => {
    const clamped = Math.max(0, Math.min(25, Math.round(newWeight * 10) / 10));
    setWeight(clamped);
    startTransition(async () => {
      await updateSetLog(setLog.id, { weight: clamped });
    });
  };

  const handleRepsChange = (newReps: number) => {
    const clamped = Math.max(1, Math.min(100, newReps));
    setReps(clamped);
    startTransition(async () => {
      await updateSetLog(setLog.id, { reps: clamped });
    });
  };

  return (
    <div
      className={`group relative flex flex-col p-2.5 sm:p-3 rounded-xl border transition-all ${
        completed
          ? "bg-lime-950/20 border-lime-500/40 opacity-90"
          : "bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700"
      }`}
    >
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Set Indicator */}
        <div className="flex items-center gap-2 min-w-[54px]">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
              completed
                ? "bg-lime-400 text-black shadow-[0_0_10px_#39ff14]"
                : "bg-zinc-800 text-zinc-300 border border-zinc-700"
            }`}
          >
            {setLog.setNumber}
          </div>
          <span className="hidden sm:inline text-xs text-zinc-500 font-medium">เซ็ต</span>
        </div>

        {/* Weight Control */}
        <div className="flex-1 max-w-[135px] sm:max-w-[160px]">
          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-medium mb-1">
            <span>น้ำหนัก</span>
            {plateSetup && (
              <button
                type="button"
                onClick={() => setShowPlateGuide(!showPlateGuide)}
                className="text-lime-400 hover:underline flex items-center gap-0.5 text-[10px]"
              >
                <Info className="w-3 h-3" />
                แผ่น
              </button>
            )}
          </div>
          <div className="flex items-center bg-zinc-900 rounded-lg border border-zinc-800 p-1 focus-within:border-lime-400 transition">
            <button
              type="button"
              onClick={() => handleWeightChange(weight - 0.5)}
              className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs"
            >
              -
            </button>
            <input
              type="number"
              step="0.5"
              value={weight === 0 ? "" : weight}
              placeholder="0"
              onChange={(e) => handleWeightChange(parseFloat(e.target.value) || 0)}
              className="w-full text-center bg-transparent font-mono font-bold text-sm text-zinc-100 focus:outline-none"
            />
            <span className="text-[10px] text-zinc-500 font-mono pr-1">kg</span>
            <button
              type="button"
              onClick={() => handleWeightChange(weight + 0.5)}
              className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs"
            >
              +
            </button>
          </div>
        </div>

        {/* Reps Control */}
        <div className="flex-1 max-w-[110px] sm:max-w-[130px]">
          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-medium mb-1">
            <span>ครั้ง (Reps)</span>
            <span className="text-[9px] text-zinc-500">
              เป้า {targetRepsMin}-{targetRepsMax}
            </span>
          </div>
          <div className="flex items-center bg-zinc-900 rounded-lg border border-zinc-800 p-1 focus-within:border-lime-400 transition">
            <button
              type="button"
              onClick={() => handleRepsChange(reps - 1)}
              className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs"
            >
              -
            </button>
            <input
              type="number"
              value={reps}
              onChange={(e) => handleRepsChange(parseInt(e.target.value) || 0)}
              className="w-full text-center bg-transparent font-mono font-bold text-sm text-zinc-100 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleRepsChange(reps + 1)}
              className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs"
            >
              +
            </button>
          </div>
        </div>

        {/* Big Neon Fat-Finger Complete Checkbox */}
        <div className="flex items-center gap-1.5 pl-1">
          <button
            type="button"
            onClick={handleToggleComplete}
            aria-label={`Mark Set ${setLog.setNumber} complete`}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-200 touch-press ${
              completed
                ? "bg-lime-400 text-black shadow-[0_0_15px_rgba(57,255,20,0.5)] scale-105"
                : "bg-zinc-800/90 text-zinc-500 hover:text-lime-400 hover:border-lime-400/50 border border-zinc-700/80"
            }`}
          >
            <Check className={`w-6 h-6 stroke-[3] ${completed ? "text-black" : "text-zinc-600 group-hover:text-zinc-400"}`} />
          </button>

          {/* Delete Set option */}
          <button
            type="button"
            onClick={() => onDeleteSet(setLog.id)}
            className="p-1.5 text-zinc-600 hover:text-rose-400 rounded-lg hover:bg-zinc-900 transition opacity-0 group-hover:opacity-100"
            title="ลบเซ็ตนี้"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Plate Breakdown Sub-tip */}
      {showPlateGuide && plateSetup && (
        <div className="mt-2 text-xs py-1.5 px-3 rounded-lg bg-zinc-900/90 border border-lime-400/30 text-lime-300 flex items-center justify-between animate-in fade-in">
          <span>💡 <strong>{weight} kg:</strong> {plateSetup.platesDescription}</span>
          <button
            onClick={() => setShowPlateGuide(false)}
            className="text-zinc-400 hover:text-white text-[10px] underline ml-2"
          >
            ปิด
          </button>
        </div>
      )}
    </div>
  );
}
