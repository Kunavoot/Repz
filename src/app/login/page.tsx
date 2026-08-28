"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get("registered") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    setError(null);
    try {
      const res = await signIn("credentials", {
        email: "demo@repz.app",
        password: "demo",
        redirect: false,
      });

      if (res?.error) {
        setError("ไม่สามารถเข้าสู่ระบบ Demo ได้");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-6">
      {/* Brand Icon & Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-lime-400 text-black flex items-center justify-center font-black text-2xl neon-glow">
          R
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          เข้าสู่ระบบ REPZ
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          เว็บแอปบันทึกตารางการฝึก Superset และพัฒนาการน้ำหนักดัมเบล
        </p>
      </div>

      {isRegistered && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-lime-950/60 border border-lime-800/80 text-lime-300 text-xs sm:text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-lime-400" />
          <span>สมัครสมาชิกเรียบร้อยแล้ว กรุณาเข้าสู่ระบบด้วยบัญชีของคุณ</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Email + Password Form */}
      <form onSubmit={handleCredentialsLogin} className="space-y-4">
        <div className="space-y-1.5 text-left">
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-lime-400" />
            อีเมล (Email)
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="youremail@example.com"
            className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition"
          />
        </div>

        <div className="space-y-1.5 text-left">
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-lime-400" />
            รหัสผ่าน (Password)
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || isDemoLoading}
          className="w-full mt-2 py-3.5 px-4 rounded-xl bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-black font-black text-sm flex items-center justify-center gap-2 transition neon-glow active:scale-[0.98] cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>กำลังเข้าสู่ระบบ...</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>เข้าสู่ระบบ</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="border-t border-zinc-800 w-full" />
        <span className="bg-zinc-900 px-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
          หรือ
        </span>
        <div className="border-t border-zinc-800 w-full" />
      </div>

      {/* Quick Demo Login */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={isLoading || isDemoLoading}
          className="w-full py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition border border-zinc-700/60 active:scale-[0.98] cursor-pointer"
        >
          {isDemoLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 text-lime-400" />
          )}
          <span>ทดลองใช้ด่วน (Demo Account)</span>
        </button>

        <p className="text-[11px] text-zinc-500 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-lime-400" />
          รหัสผ่านถูกจัดเก็บด้วยการเข้ารหัสความปลอดภัยสูง (Hash + Salt)
        </p>
      </div>

      {/* Footer */}
      <div className="pt-2 text-center text-xs text-zinc-400 border-t border-zinc-800/80">
        ยังไม่มีบัญชีใช่ไหม?{" "}
        <Link
          href="/signup"
          className="text-lime-400 hover:underline font-semibold transition"
        >
          สมัครสมาชิกใหม่
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <Suspense fallback={<div className="text-zinc-500 text-sm">กำลังโหลด...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
