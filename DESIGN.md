# Repz - Workout Tracker Design Document

เอกสารฉบับนี้อธิบายโครงสร้างและการออกแบบของแอปพลิเคชัน "Repz" ซึ่งเป็นเว็บแอปบันทึกการออกกำลังกาย (Workout Tracker) ที่เน้นความเรียบง่าย ทันสมัย และยืดหยุ่นต่อการใช้งาน

---

## 1. บริบทและฟีเจอร์หลัก (Context & Core Features)

- **ระบบ Multi-user:** ผู้ใช้สามารถ Login (ผ่าน NextAuth.js) และมีข้อมูลแยกเป็นของตัวเอง
- **การจัดการแผนการฝึก:** ข้อมูลแผนการฝึกจาก `workout_plan.md` จะถูก Seed เข้าสู่ Database เป็นค่าเริ่มต้น ผู้ใช้สามารถเลือกเล่นเป็น Routine (Flexible Split) ได้โดยไม่ผูกติดกับวันในปฏิทินเป๊ะๆ
- **บันทึกผลตามจริง:** สามารถติ๊กบันทึกแต่ละเซ็ตของท่า (Per-Exercise Set) แยกกันได้ พร้อมแก้ไขตัวเลข Reps และ น้ำหนักจริงที่ใช้ในเซ็ตนั้น
- **ระบบ Superset:** หน้า UI จะแสดงท่าที่ต้องเล่นต่อกัน (Superset) เป็นกลุ่มก้อนเดียวกัน เพื่อให้ง่ายต่อการดู
- **ประวัติและพัฒนาการ:** มีหน้ารวมประวัติการออกกำลังกาย (History) และหน้าดูกราฟพัฒนาการ "น้ำหนักสูงสุด (Max Weight)" ของแต่ละท่า (Progress Tracking)

---

## 2. ดีไซน์และ UI/UX (Design & Theme)

- **Theme:** โทนสี ดำ-เขียว (Dark Mode เป็นค่าเริ่มต้น)
  - *Background:* ดำล้วน หรือ เทาเข้มมาก (Zinc-950 / Black)
  - *Primary Accent:* สีเขียว Neon (เช่น `#39FF14` หรือ Tailwind `lime-400` ถึง `green-400`) สำหรับปุ่มกด, Checkbox, และเส้นกราฟ
- **สไตล์:** Minimal, Sleek, Modern (ใช้ `shadcn/ui` เป็นแกนหลัก เน้นเส้นขอบบางๆ และความโปร่ง)
- **Responsive:** Mobile-first design เนื่องจากผู้ใช้ส่วนใหญ่จะเปิดใช้งานบนมือถือขณะอยู่ในยิม ปุ่มติ๊กเซ็ตต้องใหญ่กดง่าย (Fat-finger friendly)

---

## 3. Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS + `shadcn/ui` (Radix UI)
- **Database:** Neon (Serverless Postgres)
- **ORM:** Prisma (อ่านง่าย กำหนด Schema ชัดเจน และเข้ากับ Next.js ได้ดี)
- **Authentication:** NextAuth.js (Auth.js v5)
- **Deployment:** Vercel

---

## 4. โครงสร้างข้อมูล (Data Model - Prisma Schema)

```prisma
// schema.prisma (จำลอง)

model User {
  id            String           @id @default(cuid())
  name          String?
  email         String?          @unique
  sessions      WorkoutSession[]
  // ... fields อื่นๆ ของ NextAuth
}

// ข้อมูลท่าออกกำลังกายทั้งหมดในระบบ (เช่น Decline Push-ups, DB Row)
model Exercise {
  id            String             @id @default(cuid())
  name          String
  targetMuscle  String?
  setLogs       SetLog[]
  workoutConfig WorkoutExercise[]
}

// รูปแบบ Routine (เช่น Repz Weekly Plan)
model Routine {
  id            String             @id @default(cuid())
  name          String
  workouts      RoutineWorkout[]
}

// วันใน Routine (เช่น Push Day, Pull Day)
model RoutineWorkout {
  id            String             @id @default(cuid())
  routineId     String
  routine       Routine            @relation(fields: [routineId], references: [id])
  name          String             // เช่น "Push" หรือ "Pull"
  order         Int                // ลำดับการเล่น
  exercises     WorkoutExercise[]
}

// การตั้งค่าแต่ละท่าในวันที่ฝึก (ระบุว่าเป็น Superset กันหรือไม่ และเป้าหมาย)
model WorkoutExercise {
  id               String          @id @default(cuid())
  routineWorkoutId String
  exerciseId       String
  supersetGroupId  String?         // ถ้ามี id ตรงกันแปลว่าเล่นเป็น Superset คู่กัน
  order            Int
  targetSets       Int
  targetRepsMin    Int
  targetRepsMax    Int
  
  routineWorkout   RoutineWorkout  @relation(fields: [routineWorkoutId], references: [id])
  exercise         Exercise        @relation(fields: [exerciseId], references: [id])
}

// ----------------------------------------------------
// ข้อมูลการเล่นจริงของผู้ใช้ (Transactional Data)
// ----------------------------------------------------

// บันทึกการเปิดโหมดออกกำลังกายในแต่ละวัน
model WorkoutSession {
  id               String          @id @default(cuid())
  userId           String
  routineWorkoutId String
  startTime        DateTime        @default(now())
  endTime          DateTime?
  
  user             User            @relation(fields: [userId], references: [id])
  setLogs          SetLog[]
}

// บันทึกผลรายเซ็ตแยกรายท่า
model SetLog {
  id               String          @id @default(cuid())
  sessionId        String
  exerciseId       String
  setNumber        Int
  reps             Int             // ทำได้จริงกี่ครั้ง
  weight           Float           // ใช้น้ำหนักจริงเท่าไหร่
  completed        Boolean         @default(false)
  createdAt        DateTime        @default(now())

  session          WorkoutSession  @relation(fields: [sessionId], references: [id])
  exercise         Exercise        @relation(fields: [exerciseId], references: [id])
}
```

---

## 5. User Flow (ลำดับการใช้งาน)

1. **เปิดแอป & Login:** ผู้ใช้เข้าเว็บ ทำการ Login ด้วย Google/Email ผ่าน NextAuth
2. **Dashboard (Home):**
   - ระบบแสดงว่า "ครั้งล่าสุดคุณเล่น Day X ไป วันนี้ถึงคิวของ **Day Y (Pull)**"
   - มีปุ่มใหญ่ๆ **"Start Workout"**
3. **Active Workout Screen (`/workout/[sessionId]`):**
   - เมื่อกด Start ระบบจะสร้าง `WorkoutSession` ใหม่และพามาหน้านี้
   - หน้าจอจะแสดงรายการท่าออกกำลังกาย โดยจัดกลุ่ม **Superset** ให้อยู่ใน Card เดียวกัน (เพื่อให้รู้ว่าต้องเล่นคู่กัน)
   - ใต้แต่ละท่า จะมี Row สำหรับระบุเซ็ต (เช่น Set 1, Set 2, Set 3)
   - แต่ละ Row มี Input Box สำหรับ **น้ำหนัก (kg)** และ **จำนวนครั้ง (reps)** โดยค่าเริ่มต้นจะดึงเป้าหมายจาก Plan หรือน้ำหนักที่เคยยกได้ล่าสุดมาแสดง
   - ด้านขวาสุดของ Row เป็น **Checkbox (ปุ่มวงกลมใหญ่ๆ)** เมื่อกดติ๊ก ระบบจะทำการเซฟ (Auto-save) ข้อมูลลง DB ทันที
4. **Finish Workout:** เมื่อติ๊กครบ (หรือพอใจแล้ว) กดปุ่ม "Finish" ระบบลงเวลา `endTime` และพากลับหน้า Dashboard
5. **Progress & History:** ผู้ใช้สามารถเข้าไปดูแท็บ "กราฟพัฒนาการ" เพื่อดูเส้นกราฟน้ำหนักสูงสุดที่ยกได้ของท่า Decline Push-ups เป็นต้น

---

## 6. โครงสร้างหน้าจอและ Route หลัก (Next.js App Router)

```text
src/app/
├── (auth)/
│   └── login/page.tsx             # หน้า Login (UI เรียบๆ ปุ่ม Neon)
├── (dashboard)/
│   ├── page.tsx                   # หน้าหลัก Dashboard, ปุ่ม Start Workout
│   ├── history/page.tsx           # หน้าลิสต์ประวัติการเล่นย้อนหลัง
│   └── progress/page.tsx          # หน้ากราฟแสดงพัฒนาการ (Max Weight Chart)
├── workout/
│   └── [sessionId]/page.tsx       # หน้าต่าง Active Workout (กำลังออกกำลังกาย)
└── api/
    ├── auth/[...nextauth]/route.ts # ตัวจัดการ NextAuth
    └── trpc/[trpc]/route.ts       # (ถ้าใช้ tRPC) หรือเป็น Server Actions
```

---

## 7. Component Structure (แนวทาง Shadcn UI)

- **`SupersetCard`**: Component กรอบ (Card) ที่ครอบ Exercise ไว้ด้วยกัน 2 อัน ถ้าเป็นท่าเดี่ยวๆ ก็มีแค่ 1 อัน
- **`ExerciseBlock`**: หัวข้อของท่า มีรูปหรือชื่อท่า พร้อมข้อความคำแนะนำ (เช่น Target: 10-12 reps)
- **`SetRow`**: ส่วนประกอบที่เล็กที่สุด ประกอบด้วย `Input` (shadcn) 2 ช่องสำหรับ Reps/Weight และ `Checkbox` สีเขียว Neon ทางด้านขวา
- **`ProgressChart`**: ใช้ `recharts` ในการทำกราฟเส้น (Line Chart) ซ้อนใน Card ของ shadcn ให้ดูทันสมัย เส้นกราฟตั้งค่าเป็นสีเขียว Neon (`stroke="#39FF14"`)

---

## 8. ขั้นตอนการนำไปพัฒนาต่อ (Next Steps)

1. Setup โปรเจกต์ Next.js + Tailwind + shadcn/ui
2. Config ธีมสี (แก้ไข `globals.css` และ `tailwind.config.ts`) ให้เป็นสไตล์ Dark + Neon Green
3. Setup Prisma Schema และ Migrate ขึ้น Neon DB
4. สร้าง Seed script เพื่ออ่านข้อมูลจาก `workout_plan.md` (หรือ Hardcode โครงสร้าง JSON ของแผนลงไป) แล้วยิงเข้าตาราง Exercise, Routine, RoutineWorkout
5. ขึ้นโครง UI ด้วย Mock Data ก่อนเริ่มต่อ API
