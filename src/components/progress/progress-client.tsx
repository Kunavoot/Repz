"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Trophy, Dumbbell, Activity, Calendar } from "lucide-react";

interface ProgressClientProps {
  data: {
    exercises: Array<{
      id: string;
      name: string;
      thaiName: string | null;
      targetMuscle: string | null;
      equipmentType: string | null;
    }>;
    activeExercise: {
      id: string;
      name: string;
      thaiName: string | null;
      targetMuscle: string | null;
    } | null;
    chartData: Array<{
      date: string;
      maxWeight: number;
      totalVolume: number;
      totalReps: number;
    }>;
    stats: {
      maxWeightAllTime: number;
      totalSetsCompleted: number;
      totalSessions: number;
    } | null;
  };
}

export function ProgressClient({ data }: ProgressClientProps) {
  const router = useRouter();
  const { exercises, activeExercise, chartData, stats } = data;
  const [selectedExId, setSelectedExId] = useState(activeExercise?.id || "");

  const handleSelectExercise = (id: string) => {
    setSelectedExId(id);
    router.push(`/progress?exerciseId=${id}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-lime-400 font-bold text-xs uppercase tracking-wider mb-1">
          <TrendingUp className="w-4 h-4" />
          <span>Progressive Overload</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          กราฟพัฒนาการน้ำหนัก (Max Weight)
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
          ติดตามการเพิ่มน้ำหนักและความแข็งแรงในแต่ละท่า
        </p>
      </div>

      {/* Exercise Selector Dropdown */}
      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          เลือกท่าออกกำลังกายที่ต้องการดูกราฟ:
        </label>
        <select
          value={selectedExId}
          onChange={(e) => handleSelectExercise(e.target.value)}
          className="w-full py-3 px-4 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-medium focus:outline-none focus:border-lime-400 text-sm transition"
        >
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id} className="bg-zinc-900 text-zinc-100">
              {ex.thaiName ? `${ex.thaiName} (${ex.name})` : ex.name}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Summary */}
      {stats && activeExercise && (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
            <div className="text-xs text-zinc-400 font-medium">น้ำหนักสูงสุด (PR)</div>
            <div className="text-xl sm:text-2xl font-black text-lime-400 mt-1 font-mono">
              {stats.maxWeightAllTime > 0 ? `${stats.maxWeightAllTime} kg` : "Bodyweight"}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
            <div className="text-xs text-zinc-400 font-medium">เซ็ตที่บันทึกแล้ว</div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1 font-mono">
              {stats.totalSetsCompleted} <span className="text-xs text-zinc-400 font-normal">เซ็ต</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
            <div className="text-xs text-zinc-400 font-medium">จำนวนครั้งที่ฝึก</div>
            <div className="text-xl sm:text-2xl font-black text-zinc-200 mt-1 font-mono">
              {stats.totalSessions} <span className="text-xs text-zinc-400 font-normal">วัน</span>
            </div>
          </div>
        </div>
      )}

      {/* Recharts Line Chart Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {activeExercise?.thaiName || activeExercise?.name}
            </h3>
            <p className="text-xs text-zinc-400">เส้นกราฟแสดงน้ำหนักสูงสุด (kg) ในแต่ละเซสชัน</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-lime-400 font-mono font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-lime-400 shadow-[0_0_8px_#39ff14]" />
            Max Weight (kg)
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="text-center py-16 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
            <Activity className="w-8 h-8 mx-auto text-zinc-600" />
            <p className="text-sm font-semibold text-zinc-300">ยังไม่มีข้อมูลการฝึกสำหรับท่านี่</p>
            <p className="text-xs text-zinc-500">
              เมื่อคุณเล่นและบันทึกเซ็ตของท่านี่ กราฟพัฒนาการจะถูกวาดขึ้นโดยอัตโนมัติ
            </p>
          </div>
        ) : (
          <div className="h-[280px] sm:h-[340px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="date"
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#3f3f46" }}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#3f3f46" }}
                  unit="kg"
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-3 rounded-xl bg-zinc-900 border border-lime-500/50 shadow-xl text-xs space-y-1 font-sans">
                          <div className="font-bold text-white mb-1">{label}</div>
                          <div className="text-lime-400 font-mono font-bold">
                            Max Weight: {d.maxWeight} kg
                          </div>
                          <div className="text-zinc-400 font-mono">
                            Total Volume: {d.totalVolume.toFixed(0)} kg ({d.totalReps} reps)
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="maxWeight"
                  stroke="#39ff14"
                  strokeWidth={3}
                  dot={{ fill: "#39ff14", r: 5, strokeWidth: 2, stroke: "#09090b" }}
                  activeDot={{ r: 7, fill: "#ffffff", stroke: "#39ff14", strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
