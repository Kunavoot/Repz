import type { Metadata } from "next";
import { Navbar, MobileBottomNav } from "@/components/navbar";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Repz - Smart Superset Workout Tracker",
  description: "บันทึกการออกกำลังกายแบบ Superset และติดตามพัฒนาการน้ำหนักดัมเบล",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen antialiased selection:bg-lime-400 selection:text-black">
        <Providers>
          <Navbar />
          {children}
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}
