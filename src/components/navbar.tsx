"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  History,
  TrendingUp,
  LogOut,
  LogIn,
  User as UserIcon,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Hide main nav during active workout screen, auth pages, or Landing page for guests
  if (
    pathname?.startsWith("/workout/") ||
    pathname === "/login" ||
    pathname === "/signup" ||
    (pathname === "/" && !session?.user)
  ) {
    return null;
  }

  const navItems = [
    { href: "/dashboard", label: "หน้าหลัก", icon: LayoutDashboard },
    { href: "/history", label: "ประวัติ", icon: History },
    { href: "/progress", label: "พัฒนาการ", icon: TrendingUp },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href={session?.user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-lime-400 text-black flex items-center justify-center font-black text-lg tracking-tighter neon-glow-sm group-hover:scale-105 transition-transform">
            R
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-black text-xl tracking-tight text-white">REPZ</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-lime-400 px-1.5 py-0.5 rounded bg-lime-950/80 border border-lime-500/40">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-medium leading-none">Superset Tracker</p>
          </div>
        </Link>

        {/* Desktop Navigation - Only visible when logged in */}
        {session?.user && (
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? "bg-zinc-800 text-lime-400 border border-zinc-700/60 shadow-sm"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-lime-400" : "text-zinc-400"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Actions & User Profile */}
        <div className="flex items-center gap-2">
          {status === "loading" ? (
            <div className="w-8 h-8 rounded-xl bg-zinc-900 animate-pulse border border-zinc-800" />
          ) : session?.user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-800/80">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="w-5 h-5 rounded-full bg-zinc-800"
                  />
                ) : (
                  <UserIcon className="w-3.5 h-3.5 text-lime-400" />
                )}
                <span className="font-semibold max-w-[100px] truncate text-white">
                  {session.user.name || session.user.email?.split("@")[0]}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                title="ออกจากระบบ"
                className="p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-bold text-xs transition neon-glow-sm cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>เข้าสู่ระบบ</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Hide bottom nav on active workout, auth pages, or when unauthenticated
  if (
    pathname?.startsWith("/workout/") ||
    pathname === "/login" ||
    pathname === "/signup" ||
    !session?.user
  ) {
    return null;
  }

  const navItems = [
    { href: "/dashboard", label: "หน้าหลัก", icon: LayoutDashboard },
    { href: "/history", label: "ประวัติ", icon: History },
    { href: "/progress", label: "พัฒนาการ", icon: TrendingUp },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/90 backdrop-blur-lg border-t border-zinc-800/80 px-4 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl text-xs font-medium transition ${
                isActive ? "text-lime-400 font-semibold" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition ${
                  isActive ? "bg-lime-400/10 border border-lime-400/30" : "bg-transparent"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-lime-400" : "text-zinc-400"}`} />
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
