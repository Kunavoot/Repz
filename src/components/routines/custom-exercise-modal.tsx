"use client";

import React, { useState, useTransition } from "react";
import { X, Dumbbell, AlertCircle, Loader2 } from "lucide-react";
import { MUSCLE_GROUPS, EQUIPMENT_TYPES } from "@/lib/exercise-options";
import { createCustomExercise, updateCustomExercise, CustomExerciseInput } from "@/actions/custom-routine";

interface CustomExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: {
    id: string;
    name: string;
    thaiName: string | null;
    targetMuscle: string | null;
    equipmentType: string | null;
    isUnilateral: boolean;
    weightInstruction: string | null;
    notes: string | null;
  } | null;
}

export function CustomExerciseModal(props: CustomExerciseModalProps) {
  if (!props.isOpen) return null;
  return (
    <CustomExerciseModalContent
      key={props.initialData?.id || "new"}
      {...props}
    />
  );
}

function CustomExerciseModalContent({
  onClose,
  onSuccess,
  initialData,
}: CustomExerciseModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CustomExerciseInput>({
    name: initialData?.name || "",
    thaiName: initialData?.thaiName || "",
    targetMuscle: initialData?.targetMuscle || MUSCLE_GROUPS[0].value,
    equipmentType: initialData?.equipmentType || EQUIPMENT_TYPES[0].value,
    isUnilateral: initialData?.isUnilateral || false,
    weightInstruction: initialData?.weightInstruction || "",
    notes: initialData?.notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("กรุณาระบุชื่อท่าภาษาอังกฤษ (เช่น Incline DB Press)");
      return;
    }

    startTransition(async () => {
      try {
        if (initialData?.id) {
          await updateCustomExercise(initialData.id, formData);
        } else {
          await createCustomExercise(formData);
        }
        onSuccess?.();
        onClose();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึก");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-lime-400/10 text-lime-400 border border-lime-400/20">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialData ? "แก้ไขท่าออกกำลังกาย" : "เพิ่มท่าออกกำลังกายใหม่"}
              </h2>
              <p className="text-xs text-zinc-400">Custom Exercise</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Name EN */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              ชื่อท่า (English) <span className="text-lime-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Incline Dumbbell Bench Press"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-lime-400/60 focus:ring-1 focus:ring-lime-400/60 transition"
            />
          </div>

          {/* Name TH */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              ชื่อภาษาไทย (ถ้ามี)
            </label>
            <input
              type="text"
              placeholder="e.g. ดันดัมเบลเบาะเอียงขึ้น"
              value={formData.thaiName || ""}
              onChange={(e) => setFormData({ ...formData, thaiName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-lime-400/60 focus:ring-1 focus:ring-lime-400/60 transition"
            />
          </div>

          {/* Target Muscle & Equipment in 2 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Muscle */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                กลุ่มกล้ามเนื้อหลัก <span className="text-lime-400">*</span>
              </label>
              <select
                value={formData.targetMuscle}
                onChange={(e) => setFormData({ ...formData, targetMuscle: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-lime-400/60 focus:ring-1 focus:ring-lime-400/60 transition"
              >
                {MUSCLE_GROUPS.map((mg) => (
                  <option key={mg.value} value={mg.value} className="bg-zinc-900 text-white">
                    {mg.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Equipment Type */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                ประเภทอุปกรณ์ <span className="text-lime-400">*</span>
              </label>
              <select
                value={formData.equipmentType}
                onChange={(e) => setFormData({ ...formData, equipmentType: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-lime-400/60 focus:ring-1 focus:ring-lime-400/60 transition"
              >
                {EQUIPMENT_TYPES.map((eq) => (
                  <option key={eq.value} value={eq.value} className="bg-zinc-900 text-white">
                    {eq.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Unilateral Checkbox */}
          <div className="flex items-center gap-3 p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-xl">
            <input
              type="checkbox"
              id="isUnilateral"
              checked={formData.isUnilateral}
              onChange={(e) => setFormData({ ...formData, isUnilateral: e.target.checked })}
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-lime-400 focus:ring-lime-400/40 focus:ring-offset-zinc-900 cursor-pointer accent-lime-400"
            />
            <label htmlFor="isUnilateral" className="text-sm text-zinc-300 cursor-pointer select-none">
              <span className="font-semibold text-white">เล่นทีละข้าง (Unilateral)</span>
              <p className="text-xs text-zinc-500">เช่น ดัมเบลข้างเดียว สลับซ้าย-ขวา</p>
            </label>
          </div>

          {/* Weight Instruction */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              คำแนะนำการคิดน้ำหนัก
            </label>
            <input
              type="text"
              placeholder="e.g. น้ำหนักต่อข้าง หรือ น้ำหนักรวม 2 มือ"
              value={formData.weightInstruction || ""}
              onChange={(e) => setFormData({ ...formData, weightInstruction: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-lime-400/60 focus:ring-1 focus:ring-lime-400/60 transition"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              คำแนะนำ & ฟอร์มการเล่น
            </label>
            <textarea
              rows={2}
              placeholder="e.g. ปรับเบาะ 30 องศา ล็อคสะบัก โฟกัสอกส่วนบน"
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-lime-400/60 focus:ring-1 focus:ring-lime-400/60 transition resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 text-sm font-medium transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-bold text-sm flex items-center gap-2 transition disabled:opacity-50"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{initialData ? "บันทึกการแก้ไข" : "สร้างท่าใหม่"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
