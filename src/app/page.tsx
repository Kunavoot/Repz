import Link from "next/link";
import { ArrowRight, Flame, Layers, Zap, Activity, CheckCircle2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 overflow-x-hidden selection:bg-lime-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-lime-400 flex items-center justify-center shadow-[0_0_15px_rgba(163,230,53,0.4)]">
              <Flame className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">Repz</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition">
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-black text-sm font-bold shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:shadow-[0_0_25px_rgba(163,230,53,0.5)] transition-all"
            >
              เริ่มใช้งานฟรี
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-lime-500/10 blur-[120px] rounded-[100%] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10">
          <div className="text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-lime-400">
              <Zap className="w-4 h-4 fill-lime-400" />
              <span>Track. Lift. Conquer.</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Unlock Your <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-300 to-lime-500">
                Next Level.
              </span>
              <br className="hidden lg:block" />
              <span className="text-2xl sm:text-3xl lg:text-4xl text-zinc-300 mt-2 block font-bold">
                ปลดล็อกขีดจำกัดใหม่ในตัวคุณ
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              อย่าปล่อยให้ความพยายามสูญเปล่า บันทึกทุกเซ็ต ติดตามทุกพัฒนาการ และทำลายสถิติ (PR) ของคุณในทุกครั้งที่ยกเหล็ก
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-lime-400 hover:bg-lime-300 text-black font-black text-base tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-lime-400/20 hover:scale-105 active:scale-95 transition-all"
              >
                สร้างบัญชีใช้งานฟรี
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Glassmorphism UI Mockup */}
          <div className="relative mx-auto w-full max-w-md perspective-1000">
            <div className="absolute inset-0 bg-gradient-to-tr from-lime-500/20 to-transparent blur-2xl transform rotate-12 scale-105" />
            
            <div className="relative bg-zinc-900/60 backdrop-blur-2xl border border-white/10 p-6 rounded-3xl shadow-2xl transform rotate-y-[-5deg] rotate-x-[5deg] transition-transform hover:rotate-y-0 hover:rotate-x-0 duration-500">
              
              {/* Header */}
              <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Bench Press</h3>
                  <p className="text-xs text-zinc-400">Chest & Triceps</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/20 text-lime-400 text-xs font-bold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Working Set
                </div>
              </div>

              {/* Sets */}
              <div className="space-y-3">
                {[
                  { set: 1, weight: 80, reps: 10, done: true },
                  { set: 2, weight: 90, reps: 8, done: true },
                ].map((s) => (
                  <div key={s.set} className="flex items-center justify-between p-3 rounded-2xl bg-zinc-800/50 border border-white/5 opacity-70">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                      {s.set}
                    </div>
                    <div className="text-sm font-mono text-zinc-300">{s.weight} kg</div>
                    <div className="text-sm font-mono text-zinc-300">{s.reps} reps</div>
                    <CheckCircle2 className="w-5 h-5 text-lime-500" />
                  </div>
                ))}

                {/* PR Set */}
                <div className="relative flex items-center justify-between p-3 rounded-2xl bg-zinc-800 border border-lime-500/30 overflow-hidden group">
                  <div className="absolute inset-0 bg-lime-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-8 h-8 rounded-full bg-lime-500/20 flex items-center justify-center text-xs font-bold text-lime-400">
                    3
                  </div>
                  <div className="text-sm font-mono font-bold text-white">100 kg</div>
                  <div className="text-sm font-mono font-bold text-white">8 reps</div>
                  
                  {/* PR Badge */}
                  <div className="absolute -top-3 -right-2 transform rotate-12 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-lg animate-pulse">
                    🔥 NEW PR!
                  </div>
                  
                  <div className="w-6 h-6 rounded-full border-2 border-lime-500 flex items-center justify-center cursor-pointer">
                    <div className="w-3 h-3 bg-lime-500 rounded-full" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-zinc-950 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-white">ออกแบบมาเพื่อการเติบโตของคุณ</h2>
            <p className="text-zinc-400 mt-3">ฟีเจอร์ครบครันที่ช่วยให้การบันทึกการออกกำลังกายเป็นเรื่องง่าย</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Layers,
                title: "รองรับทุกสไตล์การยก",
                desc: "ไม่ว่าคุณจะเล่นแบบ Straight Set ปกติ หรือจัดตาราง Superset เข้มข้น Repz ก็พร้อมรองรับทุกรูปแบบ"
              },
              {
                icon: Zap,
                title: "บันทึกรวดเร็ว ไม่สะดุด",
                desc: "ออกแบบ UI ให้จดน้ำหนักและจำนวนครั้งได้ไวที่สุด เพื่อให้คุณมีสมาธิกับการยกเหล็กตรงหน้า"
              },
              {
                icon: Activity,
                title: "ติดตามสถิติส่วนบุคคล (PR)",
                desc: "เห็นความก้าวหน้าชัดเจน ระบบจะจดจำน้ำหนักสูงสุดที่คุณเคยทำได้ และแจ้งเตือนเมื่อคุณทำลายสถิติใหม่"
              }
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 hover:border-lime-500/20 transition-colors group">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mb-6 group-hover:bg-lime-500/10 transition-colors">
                  <f.icon className="w-6 h-6 text-lime-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-lime-900/20" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-lime-500/10 blur-[100px] rounded-[100%] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
            เริ่มสร้างสถิติใหม่ของคุณวันนี้
          </h2>
          <p className="text-lg text-zinc-300 mb-10 max-w-2xl mx-auto">
            เข้าร่วมเป็นส่วนหนึ่งของผู้ใช้งานที่เลือก Repz ในการพัฒนาขีดจำกัดของตัวเอง
          </p>
          <Link
            href="/signup"
            className="inline-flex px-10 py-5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-black font-black text-lg tracking-wide items-center justify-center gap-3 shadow-xl shadow-lime-400/20 hover:scale-105 active:scale-95 transition-all"
          >
            เริ่มต้นใช้งานฟรี
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}
