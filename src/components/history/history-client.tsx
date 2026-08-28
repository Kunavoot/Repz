"use client";

import React, { useState } from "react";
import { History, Calendar, Clock, Dumbbell, ChevronDown, ChevronUp, Layers, CheckCircle2 } from "lucide-react";
import { formatDateThai, formatDuration } from "@/lib/utils";

interface HistoryClientProps {
  history: Array<{
    id: string;
    startTime: Date;
    endTime: Date | null;
    status: string;
    notes: string | null;
    routineWorkout: {
      name: string;
      thaiName: string | null;
    };
    setLogs: Array<{
      id: string;
      setNumber: number;
      reps: number;
      weight: number;
      completed: boolean;
      exercise: {
        id: string;
        name: string;
        thaiName: string | null;
      };
    }>;
  }>;
}

export function HistoryClient({ history }: HistoryClientProps) {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(
    history.length > 0 ? history[0].id : null
  );

  const totalWorkouts = history.length;
  const totalVolumeAllTime = history.reduce((acc, s) => {
    return acc + s.setLogs.reduce((sub, l) => sub + l.weight * l.reps, 0);
  }, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-lime-400 font-bold text-xs uppercase tracking-wider mb-1">
          <History className="w-4 h-4" />
          <span>Workout Log</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          ประวัติการออกกำลังกาย
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
          บันทึกผลการเล่นและสถิติน้ำหนักในแต่ละเซสชัน
        </p>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="text-xs text-zinc-400 font-medium">จำนวนครั้งที่เล่นทั้งหมด</div>
          <div className="text-2xl font-black text-white mt-1 font-mono">
            {totalWorkouts} <span className="text-xs text-lime-400 font-normal">ครั้ง</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="text-xs text-zinc-400 font-medium">Total Volume ยกสะสม</div>
          <div className="text-2xl font-black text-lime-400 mt-1 font-mono">
            {totalVolumeAllTime.toLocaleString()} <span className="text-xs text-zinc-400 font-normal">kg</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="text-xs text-zinc-400 font-medium">สถานะตารางฝึก</div>
          <div className="text-base font-bold text-zinc-200 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-lime-400" />
            Active 3-Day Split
          </div>
        </div>
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <div className="text-center py-16 p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-500">
            <Dumbbell className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">ยังไม่มีประวัติการออกกำลังกาย</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            กดปุ่ม &quot;เริ่มออกกำลังกาย&quot; ในหน้าหลัก เพื่อเริ่มบันทึกเซ็ตแรกของคุณ
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((s) => {
            const isExpanded = expandedSessionId === s.id;
            const durationSecs =
              s.endTime && s.startTime
                ? Math.floor((new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 1000)
                : 0;

            const sessionVolume = s.setLogs.reduce((acc, l) => acc + l.weight * l.reps, 0);

            // Group sets by exercise
            const exerciseGroups = new Map<string, typeof s.setLogs>();
            s.setLogs.forEach((log) => {
              const current = exerciseGroups.get(log.exercise.name) || [];
              current.push(log);
              exerciseGroups.set(log.exercise.name, current);
            });

            return (
              <div
                key={s.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isExpanded
                    ? "bg-zinc-900 border-zinc-700/80 shadow-lg"
                    : "bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedSessionId(isExpanded ? null : s.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/20">
                        {s.routineWorkout.thaiName || s.routineWorkout.name}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {formatDateThai(s.startTime)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        {formatDuration(durationSecs)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-zinc-500" />
                        {s.setLogs.filter((l) => l.completed).length} เซ็ต
                      </span>
                      <span className="flex items-center gap-1 font-mono text-lime-400 font-semibold">
                        <Dumbbell className="w-3.5 h-3.5" />
                        {sessionVolume.toFixed(0)} kg volume
                      </span>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-zinc-800/80 text-zinc-400 hover:text-white transition">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-5 pt-1 sm:px-5 border-t border-zinc-800/80 space-y-4 animate-in fade-in">
                    {Array.from(exerciseGroups.entries()).map(([exName, logs]) => {
                      const firstLog = logs[0];
                      return (
                        <div key={exName} className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
                          <div className="font-bold text-sm text-zinc-200 mb-2">
                            {firstLog.exercise.thaiName || exName}
                            {firstLog.exercise.thaiName && (
                              <span className="text-xs text-zinc-500 ml-1 font-normal">({exName})</span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {logs.map((log) => (
                              <div
                                key={log.id}
                                className={`p-2 rounded-lg text-xs font-mono border flex items-center justify-between ${
                                  log.completed
                                    ? "bg-lime-950/20 border-lime-500/30 text-lime-300"
                                    : "bg-zinc-900 border-zinc-800 text-zinc-400"
                                }`}
                              >
                                <span className="text-zinc-500 font-sans">Set {log.setNumber}:</span>
                                <span className="font-bold">
                                  {log.weight > 0 ? `${log.weight}kg × ` : ""}{log.reps} reps
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
