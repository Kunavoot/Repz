"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, X, BellRing, Plus, Volume2, VolumeX, Vibrate, VibrateOff } from "lucide-react";
import { formatDuration } from "@/lib/utils";

// Web Audio API beep
function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch {
    // Audio context may be restricted before user gesture
  }
}

interface RestTimerProps {
  initialSeconds?: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function RestTimer({
  initialSeconds = 90,
  isOpen,
  onClose,
  title = "พักระหว่างเซ็ต (Rest Time)",
}: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [totalTime, setTotalTime] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isVibrationEnabled, setIsVibrationEnabled] = useState(true);
  const soundEnabledRef = useRef(true);
  const vibeEnabledRef = useRef(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSound = localStorage.getItem("repz_sound_enabled");
    if (savedSound !== null) {
      setIsSoundEnabled(savedSound === "true");
      soundEnabledRef.current = savedSound === "true";
    }
    
    const savedVibe = localStorage.getItem("repz_vibration_enabled");
    if (savedVibe !== null) {
      setIsVibrationEnabled(savedVibe === "true");
      vibeEnabledRef.current = savedVibe === "true";
    }
  }, []);

  const toggleSound = () => {
    const newValue = !isSoundEnabled;
    setIsSoundEnabled(newValue);
    soundEnabledRef.current = newValue;
    localStorage.setItem("repz_sound_enabled", String(newValue));
  };

  const toggleVibration = () => {
    const newValue = !isVibrationEnabled;
    setIsVibrationEnabled(newValue);
    vibeEnabledRef.current = newValue;
    localStorage.setItem("repz_vibration_enabled", String(newValue));
  };

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback((seconds: number) => {
    setTimeLeft(seconds);
    setTotalTime(seconds);
    setIsRunning(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetTimer(initialSeconds);
    }
  }, [isOpen, initialSeconds, resetTimer]);

  useEffect(() => {
    if (!isOpen || !isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (soundEnabledRef.current) playChime();
          if (vibeEnabledRef.current && navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isRunning]);

  if (!isOpen) return null;

  const percentage = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 100;
  const isFinished = timeLeft === 0;

  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50 animate-in slide-in-from-bottom duration-300">
      <div className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all ${
        isFinished
          ? "bg-lime-950/95 border-lime-400 text-white neon-glow"
          : "bg-zinc-900/95 border-zinc-700/80 text-zinc-100"
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BellRing className={`w-4 h-4 ${isFinished ? "text-lime-400 animate-bounce" : "text-zinc-400"}`} />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              {isFinished ? "🔥 พร้อมเริ่มเซ็ตถัดไปแล้ว!" : title}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleSound}
              className={`p-1.5 rounded-lg transition ${isSoundEnabled ? "text-lime-400 hover:bg-zinc-800" : "text-zinc-500 hover:text-zinc-400 hover:bg-zinc-800"}`}
              title={isSoundEnabled ? "ปิดเสียง" : "เปิดเสียง"}
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleVibration}
              className={`p-1.5 rounded-lg transition ${isVibrationEnabled ? "text-lime-400 hover:bg-zinc-800" : "text-zinc-500 hover:text-zinc-400 hover:bg-zinc-800"}`}
              title={isVibrationEnabled ? "ปิดสั่น" : "เปิดสั่น"}
            >
              {isVibrationEnabled ? <Vibrate className="w-4 h-4" /> : <VibrateOff className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isFinished ? "bg-lime-400" : "bg-lime-400 shadow-[0_0_10px_#39ff14]"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black tracking-tight text-lime-400">
              {formatDuration(timeLeft)}
            </span>
            <span className="text-xs text-zinc-400 font-mono">/ {formatDuration(totalTime)}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Presets */}
            <button
              onClick={() => resetTimer(60)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
            >
              60s
            </button>
            <button
              onClick={() => resetTimer(90)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
            >
              90s
            </button>
            <button
              onClick={() => setTimeLeft((prev) => prev + 30)}
              className="flex items-center gap-0.5 px-2 py-1 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-lime-400 transition"
              title="เพิ่มเวลา 30 วินาที"
            >
              <Plus className="w-3 h-3" />
              30s
            </button>

            {/* Play/Pause */}
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="p-2 rounded-xl bg-lime-400 text-black hover:bg-lime-300 transition font-bold"
            >
              {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            {/* Reset */}
            <button
              onClick={() => resetTimer(totalTime)}
              className="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
