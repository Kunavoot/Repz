# Issue Log

## 2026-08-28 - Refactor Next.js Auth Pages to Server/Client Components

### Problem
หน้า Login และ Signup เดิมเป็น Client Components ทั้งหมด ทำให้มีความเสี่ยงที่จะเกิด Flash of unauthenticated content ก่อนที่ระบบจะ redirect สำหรับผู้ใช้ที่ logged in แล้ว

### Impact
ผู้ใช้ที่ logged in แล้วหากเข้า URL `/login` หรือ `/signup` อาจจะเห็นแบบฟอร์มล็อกอินชั่วครู่ก่อนถูกเด้งไปที่ `/dashboard`

### Root Cause
Client Components ใน Next.js ต้องรอให้ JavaScript ฝั่ง Client ทำงาน (hydrate) ก่อนถึงจะสามารถเช็ค Auth state จาก session และทำ redirect ได้

### Fix
Refactor แยก `src/app/login/page.tsx` และ `src/app/signup/page.tsx` ออกเป็น Server Components เพื่อเช็ค `await auth()` และ `redirect("/dashboard")` ในฝั่ง Server ทันที จากนั้นแยกส่วน UI ไปไว้ที่ `login-client.tsx` และ `signup-client.tsx` (โดยใน `login-client.tsx` มีการใช้ `<Suspense>` หุ้ม component ที่เรียกใช้ `useSearchParams()` อย่างถูกต้อง)

### Mistakes / Lessons
None recorded.

### Validation
PR review ตรวจสอบความถูกต้องของโค้ด โครงสร้าง Layout และการทำตาม Next.js App Router best practices แล้ว ไม่พบ regression หรือ issue เพิ่มเติม

### Remaining Risk
None known.

## 2026-09-04 - Restrict Unauthenticated Access to History & Progress

### Problem
ผู้ใช้ที่ยังไม่ได้เข้าสู่ระบบ (Guest) สามารถมองเห็นปุ่ม "ประวัติ" และ "พัฒนาการ" บน Navbar และสามารถเข้าถึง URL `/history` และ `/progress` ได้โดยระบบ fallback ไปดึงข้อมูลของ demo account ทำให้เกิดความสับสนและเสี่ยงต่อความปลอดภัยของข้อมูล

### Impact
Guest เข้าไปดูหน้าประวัติและพัฒนาการที่มีข้อมูล mock หรือ demo ปรากฏอยู่ และ Bottom Navigation บนมือถือแสดงไอคอนไม่เหมาะสมในหน้า Landing Page

### Root Cause
1. Navbar และ MobileBottomNav ไม่ได้ซ่อน navItems เมื่อไม่มี session ของผู้ใช้
2. หน้า `/history`, `/progress`, และ `/workout/[sessionId]` ขาด Route Guard ในระดับ Server Component
3. `getCurrentUserId()` ใน Server Actions มี fallback สร้าง/อ้างอิง `demo@repz.app` แทนที่จะบังคับ Auth อย่างเข้มงวด

### Fix
1. ซ่อน Desktop Nav และ `MobileBottomNav` หากยังไม่ได้ล็อกอิน (`!session?.user`) ใน `src/components/navbar.tsx`
2. เพิ่ม Server-side Route Guard ด้วย `auth()` และ `redirect("/login?callbackUrl=...")` ใน `src/app/history/page.tsx`, `src/app/progress/page.tsx`, `src/app/workout/[sessionId]/page.tsx`, และ `src/app/dashboard/page.tsx`
3. เพิ่ม Authorization และ Ownership Check ใน Server Actions (`updateSetLog`, `addSetLog`, `deleteSetLog`, `finishWorkoutSession`, `getActiveWorkoutSession`) ใน `src/actions/workout.ts` และใน `src/app/workout/[sessionId]/page.tsx` ป้องกัน IDOR / BOLA
4. สร้าง `sanitizeCallbackUrl()` ใน `src/lib/utils.ts` เพื่อป้องกัน Open Redirect (`//`, `/\`) และ Infinite Redirect Loop เข้าหน้า Auth
5. ปรับ Navbar และ MobileBottomNav ให้ซ่อนเมื่อเป็น Guest ในหน้า Landing (`/`), `/login`, และ `/signup` ป้องกัน Double Navbar
6. ปรับ `navItems` href ให้ชี้ไปที่ `/dashboard` โดยตรง เลี่ยง latency จาก server redirect (307)
7. บันทึกคำศัพท์นิยาม Protected Views และ Guest User ลงใน `CONTEXT.md`

### Validation
1. `npx tsc --noEmit` ผ่านฉลุย (Exit code 0, 0 type errors)
2. โครงสร้าง Route Redirect และ Sanitization ป้องกัน Open Redirect และ Redirect Loop ทำงานถูกต้อง
3. ตรวจสอบการ query และ update ข้อมูลใน database ผ่าน Prisma ให้ bind กับ `userId` ทุกกรณี

