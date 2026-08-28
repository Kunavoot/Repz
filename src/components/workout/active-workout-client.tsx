"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Timer, CheckCircle, Dumbbell, ArrowLeft, Trophy, Sparkles, Clock, Layers } from "lucide-react";
import confetti from "canvas-confetti";
import { SupersetCard } from "./superset-card";
import { RestTimer } from "@/components/rest-timer";
import { DumbbellPlateGuideButton } from "@/components/dumbbell-plate-guide";
import { formatDuration } from "@/lib/utils";
import { addSetLog, deleteSetLog, finishWorkoutSession } from "@/actions/workout";

interface ActiveWorkoutClientProps {
  initialSession: {
    id: string;
    startTime: Date;
    routineWorkout: {
      id: string;
      name: string;
      thaiName: string | null;
      exercises: Array<{
        id: string;
        exerciseId: string;
        supersetGroupId: string | null;
        supersetName: string | null;
        order: number;
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
    };
    setLogs: Array<{
      id: string;
      exerciseId: string;
      setNumber: number;
      reps: number;
      weight: number;
      completed: boolean;
    }>;
  };
}

export function ActiveWorkoutClient({ initialSession }: ActiveWorkoutClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [setLogs, setSetLogs] = useState(initialSession.setLogs);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    durationMs: number;
    totalVolume: number;
    completedSets: number;
  } | null>(null);

  // Live timer since session start
  useEffect(() => {
    const startTime = new Date(initialSession.startTime).getTime();
    const updateTimer = () => {
      const now = Date.now();
      setElapsedSeconds(Math.max(0, Math.floor((now - startTime) / 1000)));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [initialSession.startTime]);

  // Group workout exercises by supersetGroupId
  const groupedExercises = React.useMemo(() => {
    const groups: {
      [key: string]: {
        groupId: string;
        groupName: string;
        exercises: typeof initialSession.routineWorkout.exercises;
      };
    } = {};

    initialSession.routineWorkout.exercises.forEach((we) => {
      const gId = we.supersetGroupId || `single-${we.id}`;
      const gName = we.supersetName || we.exercise.thaiName || we.exercise.name;

      if (!groups[gId]) {
        groups[gId] = {
          groupId: gId,
          groupName: gName,
          exercises: [],
        };
      }
      groups[gId].exercises.push(we);
    });

    return Object.values(groups);
  }, [initialSession.routineWorkout.exercises]);

  const handleSetCompleted = () => {
    setShowRestTimer(true);
  };

  const handleAddSet = (exerciseId: string) => {
    startTransition(async () => {
      const newSet = await addSetLog(initialSession.id, exerciseId);
      setSetLogs((prev) => [...prev, newSet]);
    });
  };

  const handleDeleteSet = (setLogId: string) => {
    startTransition(async () => {
      await deleteSetLog(setLogId);
      setSetLogs((prev) => prev.filter((s) => s.id !== setLogId));
    });
  };

  const handleFinishWorkout = async () => {
    setIsFinishing(true);
    const result = await finishWorkoutSession(initialSession.id);
    setSummaryData(result);

    // Fire celebratory confetti!
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#39ff14", "#22c55e", "#ffffff", "#eab308"],
      });
    } catch {
      // Ignored if confetti fails
    }
  };

  const totalSets = setLogs.length;
  const completedSets = setLogs.filter((s) => s.completed).length;
  const progressPercent = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  return (
    <div className="min-h-screen bg-zinc-950 pb-28 text-zinc-100">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 w-full bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition p-1.5 rounded-lg hover:bg-zinc-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">แดชบอร์ด</span>
          </button>

          {/* Workout Title & Elapsed Timer */}
          <div className="flex items-center gap-3">
            <div className="text-center sm:text-left">
              <h1 className="text-sm sm:text-base font-bold text-white leading-tight">
                {initialSession.routineWorkout.thaiName || initialSession.routineWorkout.name}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-lime-400 font-mono">
                <Timer className="w-3.5 h-3.5" />
                <span>{formatDuration(elapsedSeconds)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DumbbellPlateGuideButton />
            <button
              onClick={() => setShowRestTimer(true)}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-lime-400 border border-zinc-700 transition"
              title="เปิดนาฬิกาพัก"
            >
              <Clock className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Progress bar */}
        <div className="max-w-3xl mx-auto mt-2.5">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
            <span>ความคืบหน้า</span>
            <span className="font-mono text-lime-400 font-bold">
              {completedSets} / {totalSets} เซ็ต ({Math.round(progressPercent)}%)
            </span>
          </div>
          <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-lime-400 transition-all duration-300 shadow-[0_0_10px_#39ff14]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Exercises Content */}
      <main className="max-w-3xl mx-auto px-4 pt-5 space-y-5">
        {groupedExercises.map((group) => (
          <SupersetCard
            key={group.groupId}
            groupId={group.groupId}
            groupName={group.groupName}
            workoutExercises={group.exercises}
            setLogs={setLogs}
            onSetCompleted={handleSetCompleted}
            onAddSet={handleAddSet}
            onDeleteSet={handleDeleteSet}
          />
        ))}

        {/* Bottom Finish Button Card */}
        <div className="pt-4 pb-8">
          <button
            onClick={handleFinishWorkout}
            disabled={isFinishing}
            className="w-full py-4 px-6 rounded-2xl bg-lime-400 hover:bg-lime-300 text-black font-black text-base tracking-wide flex items-center justify-center gap-2 neon-glow transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            <CheckCircle className="w-5 h-5 stroke-[2.5]" />
            <span>จบการออกกำลังกาย (FINISH WORKOUT)</span>
          </button>
        </div>
      </main>

      {/* Rest Timer Float */}
      <RestTimer
        isOpen={showRestTimer}
        onClose={() => setShowRestTimer(false)}
        initialSeconds={90}
      />

      {/* Summary Celebration Modal */}
      {summaryData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-zinc-900 border border-lime-500/50 rounded-3xl p-6 shadow-2xl text-center space-y-5 neon-glow">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-lime-400/20 text-lime-400 border border-lime-400/40 flex items-center justify-center">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                ยอดเยี่ยมมาก! สำเร็จแล้ว 🎉
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                บันทึกข้อมูลการออกกำลังกายและน้ำหนักเข้าสู่ระบบเรียบร้อย
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800">
              <div className="p-2">
                <div className="text-[10px] text-zinc-400 uppercase font-medium">เวลาที่ใช้</div>
                <div className="text-lg font-black font-mono text-lime-400 mt-0.5">
                  {formatDuration(Math.floor(summaryData.durationMs / 1000))}
                </div>
              </div>
              <div className="p-2 border-x border-zinc-800">
                <div className="text-[10px] text-zinc-400 uppercase font-medium">เซ็ตที่สำเร็จ</div>
                <div className="text-lg font-black font-mono text-lime-400 mt-0.5">
                  {summaryData.completedSets}
                </div>
              </div>
              <div className="p-2">
                <div className="text-[10px] text-zinc-400 uppercase font-medium">Total Volume</div>
                <div className="text-lg font-black font-mono text-lime-400 mt-0.5">
                  {summaryData.totalVolume.toFixed(0)} <span className="text-xs font-normal">kg</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => router.push("/history")}
                className="w-full py-3 rounded-xl bg-lime-400 text-black font-bold text-sm hover:bg-lime-300 transition"
              >
                ดูบันทึกประวัติการเล่น
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full py-3 rounded-xl bg-zinc-800 text-zinc-300 font-semibold text-sm hover:bg-zinc-700 transition"
              >
                กลับสู่หน้าหลัก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
