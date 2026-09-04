import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function formatDateThai(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function sanitizeCallbackUrl(url?: string | null): string {
  if (!url) return "/dashboard";
  if (!url.startsWith("/") || url.startsWith("//") || url.startsWith("/\\")) {
    return "/dashboard";
  }
  const cleanPath = url.split("?")[0].toLowerCase();
  if (cleanPath === "/login" || cleanPath === "/signup") {
    return "/dashboard";
  }
  return url;
}
