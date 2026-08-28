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
