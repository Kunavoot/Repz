"use client";

import React, { useState } from "react";
import { DUMBBELL_COMBINATIONS } from "@/lib/dumbbell-data";
import { Dumbbell, Info, X } from "lucide-react";

export function DumbbellPlateGuideModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-700/60 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-lime-400/10 text-lime-400 border border-lime-400/20">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                คู่มือการใส่น้ำหนักดัมเบล
              </h3>
              <p className="text-xs text-zinc-400">อุปกรณ์ที่มี: แกน 0.5 kg + แผ่น (1.25, 1.5, 2.0 kg × 2)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-2.5">
          <div className="p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/40 text-xs text-zinc-300 flex items-start gap-2">
            <Info className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
            <span>
              <strong>วิธีใส่แผ่น:</strong> ตัวเลขแผ่นด้านล่างคือแผ่นที่ใส่ <strong>ต่อข้างของดัมเบล 1 อัน</strong> (ซ้ายและขวาของแกนต้องใส่เท่ากัน)
            </span>
          </div>

          <div className="grid gap-2">
            {DUMBBELL_COMBINATIONS.map((combo) => (
              <div
                key={combo.weight}
                className={`flex items-center justify-between p-3 rounded-xl border transition ${
                  combo.isFull
                    ? "bg-lime-950/20 border-lime-500/40"
                    : "bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 text-center py-1 px-1.5 rounded-lg bg-zinc-800 border border-zinc-700 font-mono font-bold text-sm text-lime-400">
                    {combo.weight.toFixed(1)} kg
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-100">
                      {combo.platesSummary}
                    </div>
                    <div className="text-xs text-zinc-400">
                      {combo.platesDescription}
                    </div>
                  </div>
                </div>
                {combo.isFull && (
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-lime-400/20 text-lime-400 border border-lime-400/30">
                    Full Set
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-lime-400 text-black font-semibold hover:bg-lime-300 transition text-sm font-medium"
          >
            เข้าใจแล้ว
          </button>
        </div>
      </div>
    </div>
  );
}

export function DumbbellPlateGuideButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700/60 transition shadow-sm"
      >
        <Dumbbell className="w-3.5 h-3.5 text-lime-400" />
        <span>ตารางแผ่นดัมเบล</span>
      </button>
      <DumbbellPlateGuideModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
