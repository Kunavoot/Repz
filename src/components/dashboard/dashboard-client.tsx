"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Play, Flame, Dumbbell, Calendar, ChevronRight, Zap, CheckCircle2, Trophy, Clock } from "lucide-react";
import { startWorkoutSession } from "@/actions/workout";
import { DumbbellPlateGuideModal } from "@/components/dumbbell-plate-guide";
import { formatDateThai } from "@/lib/utils";

interface DashboardClientProps {
  data: {
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
          name: string;
          thaiName: string | null;
        };
      }>;
    }>;
    nextWorkout: {
      id: string;
      name: string;
      thaiName: string | null;
      splitCode: string;
      exercises: Array<{
        id: string;
        order: number;
        supersetGroupId: string | null;
        exercise: {
          name: string;
          thaiName: string | null;
        };
      }>;
    } | null;
    activeSession: {
      id: string;
      routineWorkout: {
        name: string;
        thaiName: string | null;
      };
      startTime: Date;
    } | null;
    lastSession: {
      id: string;
      endTime: Date | null;
      routineWorkout: {
        name: string;
        thaiName: string | null;
      };
      setLogs: Array<{ id: string }>;
    } | null;
    recentSessions: Array<{
      id: string;
      startTime: Date;
      endTime: Date | null;
      routineWorkout: {
        name: string;
        thaiName: string | null;
      };
      setLogs: Array<{
        id: string;
        reps: number;
        weight: number;
        exercise: {
          name: string;
          thaiName: string | null;
        };
      }>;
    }>;
    workoutsThisWeek: number;
  };
}

export function DashboardClient({ data }: DashboardClientProps) {
  const router = useRouter();
  const [isStarting, startTransition] = useTransition();
  const [showDumbbellGuide, setShowDumbbellGuide] = useState(false);

  const { workouts, nextWorkout, activeSession, lastSession, recentSessions, workoutsThisWeek } = data;

  const handleStart = (workoutId: string) => {
    startTransition(async () => {
      const res = await startWorkoutSession(workoutId);
      router.push(`/workout/${res.sessionId}`);
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28 space-y-6">
      {/* Resume in-progress session banner */}
      {activeSession && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">คุณมีเซสชันที่กำลังเล่นค้างอยู่</h4>
              <p className="text-xs text-amber-200/80">
                {activeSession.routineWorkout.thaiName || activeSession.routineWorkout.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/workout/${activeSession.id}`)}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition"
          >
            เล่นต่อทันที
          </button>
        </div>
      )}

      {/* Hero Welcome / Motivation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-lime-400 flex items-center gap-1.5 mb-1">
            <Flame className="w-4 h-4 fill-lime-400" />
            Personal Superset Split
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            พร้อมลุยเซ็ตวันนี้หรือยัง? 💪
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            สัปดาห์นี้ออกกำลังกายไปแล้ว <strong className="text-lime-400 font-mono">{workoutsThisWeek}</strong> วัน (เป้าหมาย 4-5 วัน)
          </p>
        </div>

        {/* Equipment Guide Shortcut */}
        <button
          onClick={() => setShowDumbbellGuide(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-lime-500/40 text-xs font-semibold text-zinc-300 transition"
        >
          <Dumbbell className="w-4 h-4 text-lime-400" />
          <span>เช็คแผ่นดัมเบล (Max 10kg)</span>
        </button>
      </div>

      {/* Main Recommended Workout Card (Big Neon Button) */}
      {nextWorkout && (
        <div className="relative p-6 sm:p-7 rounded-3xl bg-zinc-900 border border-lime-500/40 shadow-2xl overflow-hidden neon-glow">
          <div className="absolute top-0 right-0 w-48 h-48 bg-lime-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-lime-400/20 text-lime-400 border border-lime-400/30">
                  ⚡ วันนี้ถึงคิวฝึก (Next Up)
                </span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {nextWorkout.thaiName || nextWorkout.name}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  {lastSession
                    ? `ครั้งล่าสุดเล่น ${lastSession.routineWorkout.thaiName || lastSession.routineWorkout.name} (${lastSession.endTime ? formatDateThai(lastSession.endTime) : ""})`
                    : "เริ่มต้นการฝึกวันแรกของคุณตามตาราง"}
                </p>
              </div>

              {/* Preview of Exercises */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {nextWorkout.exercises.map((we) => (
                  <span
                    key={we.id}
                    className="text-xs px-2.5 py-1 rounded-lg bg-zinc-950/80 border border-zinc-800 text-zinc-300"
                  >
                    {we.exercise.thaiName || we.exercise.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="shrink-0">
              <button
                onClick={() => handleStart(nextWorkout.id)}
                disabled={isStarting}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-lime-400 hover:bg-lime-300 text-black font-black text-base tracking-wide flex items-center justify-center gap-2.5 shadow-lg shadow-lime-400/30 hover:scale-105 active:scale-95 transition-all"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{isStarting ? "กำลังสร้างเซสชัน..." : "เริ่มออกกำลังกาย"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Routine Split Selector (Choose another day) */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Calendar className="w-4 h-4 text-lime-400" />
          เลือกตารางฝึกประจำสัปดาห์ (3-Day Split)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {workouts.map((w) => (
            <div
              key={w.id}
              className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400 font-mono">
                    Day {w.order}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {w.exercises.length} ท่า
                  </span>
                </div>
                <h4 className="font-bold text-sm text-zinc-100 mb-1">
                  {w.thaiName || w.name}
                </h4>
                <div className="text-xs text-zinc-400 space-y-1 mb-4">
                  {w.exercises.slice(0, 2).map((we) => (
                    <div key={we.id} className="truncate">
                      • {we.exercise.thaiName || we.exercise.name}
                    </div>
                  ))}
                  {w.exercises.length > 2 && (
                    <div className="text-zinc-500 text-[11px]">
                      + อีก {w.exercises.length - 2} ท่า
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleStart(w.id)}
                disabled={isStarting}
                className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Play className="w-3 h-3 fill-current text-lime-400" />
                เริ่มเล่น Day {w.order}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Workouts Log */}
      {recentSessions.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Trophy className="w-4 h-4 text-lime-400" />
              ประวัติการออกกำลังกายล่าสุด
            </h3>
            <button
              onClick={() => router.push("/history")}
              className="text-xs text-lime-400 hover:underline flex items-center gap-0.5 font-medium"
            >
              ดูทั้งหมด <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {recentSessions.map((s) => {
              const totalVolume = s.setLogs.reduce((acc, l) => acc + l.weight * l.reps, 0);
              return (
                <div
                  key={s.id}
                  className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-sm text-zinc-100">
                      {s.routineWorkout.thaiName || s.routineWorkout.name}
                    </div>
                    <div className="text-xs text-zinc-400">
                      {formatDateThai(s.startTime)} • {s.setLogs.length} เซ็ต
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-sm text-lime-400">
                      {totalVolume.toFixed(0)} kg
                    </div>
                    <div className="text-[10px] text-zinc-500 uppercase">Volume</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dumbbell Plate Modal */}
      <DumbbellPlateGuideModal
        isOpen={showDumbbellGuide}
        onClose={() => setShowDumbbellGuide(false)}
      />
    </div>
  );
}
