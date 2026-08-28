"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { UserPlus, ArrowRight, Lock, Mail, User, AlertCircle, Loader2 } from "lucide-react";
import { signUpUser } from "@/actions/auth";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    if (password.length < 6) {
      setError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (password !== confirmPassword) {
      setError("รหัสผ่านยืนยันไม่ตรงกัน");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim().toLowerCase());
      formData.append("password", password);

      const result = await signUpUser(formData);

      if (!result.success) {
        setError(result.error || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
        setIsLoading(false);
        return;
      }

      // Auto login after sign up
      const signInResult = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push("/login?registered=true");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-6">
        {/* Brand Icon & Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-lime-400 text-black flex items-center justify-center font-black text-2xl neon-glow">
            R
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            สมัครสมาชิก REPZ
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            สร้างบัญชีเพื่อบันทึกและติดตามตารางการออกกำลังกายของคุณ
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-lime-400" />
              ชื่อที่ต้องการแสดง (Display Name)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น Somchai Lifter"
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-lime-400" />
              อีเมล (Email) <span className="text-red-400">*</span>
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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-lime-400" />
              รหัสผ่าน (อย่างน้อย 6 ตัวอักษร) <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-lime-400" />
              ยืนยันรหัสผ่าน <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-black font-black text-sm flex items-center justify-center gap-2 transition neon-glow active:scale-[0.98] cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>กำลังสร้างบัญชี...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>สมัครสมาชิก</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="pt-2 text-center text-xs text-zinc-400 border-t border-zinc-800/80">
          มีบัญชีอยู่แล้ว?{" "}
          <Link
            href="/login"
            className="text-lime-400 hover:underline font-semibold transition"
          >
            เข้าสู่ระบบที่นี่
          </Link>
        </div>
      </div>
    </div>
  );
}
