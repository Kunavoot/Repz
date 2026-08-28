import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🌱 Starting Repz database seeding...");

  // 1. Create or ensure Demo User
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@repz.app" },
    update: {},
    create: {
      email: "demo@repz.app",
      name: "Demo Lifter",
      image: "https://api.dicebear.com/7.x/bottts/svg?seed=RepzLifter",
    },
  });
  console.log(`👤 Demo user created/verified: ${demoUser.email} (${demoUser.id})`);

  // 2. Exercises Definition from workout_plan.md
  const exercisesData = [
    {
      name: "Decline Push-ups",
      thaiName: "วิดพื้นยกขาสูง",
      targetMuscle: "อกบน / Triceps",
      equipmentType: "bodyweight",
      weightInstruction: "น้ำหนักตัว",
      notes: "วิดพื้นยกขาสูงบนเก้าอี้ โฟกัสเกร็งหน้าอกส่วนบนและแกนกลางลำตัว ลำตัวตรงตลอดแนว",
      isUnilateral: false,
    },
    {
      name: "Seated DB Shoulder Press",
      thaiName: "ดันไหล่นั่ง",
      targetMuscle: "ไหล่รวม (หน้า/ข้าง)",
      equipmentType: "dumbbell",
      weightInstruction: "น้ำหนักต่อข้าง",
      notes: "นั่งตัวตรงบนเก้าอี้ ดันดัมเบลขึ้นตรงๆ หายใจออกตอนดันขึ้น ข้อศอกทำมุม ~75 องศา",
      isUnilateral: false,
    },
    {
      name: "Chair Dips",
      thaiName: "ดริปกับเก้าอี้",
      targetMuscle: "หลังแขน (Triceps)",
      equipmentType: "bodyweight",
      weightInstruction: "น้ำหนักตัว (วางดัมเบลบนตักเพิ่มได้)",
      notes: "วางมือบนขอบเก้าอี้ ย่อแขนลงทำมุม 90 องศา แล้วดันตัวกลับขึ้นด้วยหลังแขน",
      isUnilateral: false,
    },
    {
      name: "DB Lateral Raises",
      thaiName: "กางแขนเล่นไหล่ข้าง",
      targetMuscle: "ไหล่ข้าง",
      equipmentType: "dumbbell",
      weightInstruction: "น้ำหนักต่อข้าง",
      notes: "ยืนหรือนั่ง กางแขนออกข้างลำตัว งอศอกเล็กน้อย เน้นโฟกัส ไม่จำเป็นต้องใช้น้ำหนักเยอะ",
      isUnilateral: false,
    },
    {
      name: "DB Bent-Over Rows",
      thaiName: "ดึงดัมเบลแนบลำตัว",
      targetMuscle: "หลังรวม (Lats / Upper Back)",
      equipmentType: "dumbbell",
      weightInstruction: "น้ำหนักต่อข้าง",
      notes: "พับสะโพก หลังตรง ดึงดัมเบลแนบลำตัว บีบสะบักเข้าหากัน หายใจออกตอนดึง",
      isUnilateral: false,
    },
    {
      name: "DB Hammer Curls",
      thaiName: "ยกดัมเบลท่าค้อน",
      targetMuscle: "หน้าแขน / Brachialis",
      equipmentType: "dumbbell",
      weightInstruction: "น้ำหนักต่อข้าง",
      notes: "หันฝ่ามือเข้าหากันตลอดการยก ล็อคข้อศอกให้อยู่ข้างลำตัว ไม่เหวี่ยงหลัง",
      isUnilateral: false,
    },
    {
      name: "DB Pullover",
      thaiName: "ดึงดัมเบลข้ามศีรษะ",
      targetMuscle: "ปีก / อกขยาย / Serratus",
      equipmentType: "dumbbell",
      weightInstruction: "ใช้ 1 ดัมเบล จับ 2 มือ",
      notes: "นอนหงายบนเก้าอี้หรือพื้น ถือดัมเบลด้วย 2 มือ ค่อยๆ ยืดข้ามศีรษะช้าๆ แล้วดึงกลับมาเหนืออก",
      isUnilateral: false,
    },
    {
      name: "Seated Rear Delt Flyes",
      thaiName: "กางแขนโน้มตัวเล่นไหล่หลัง",
      targetMuscle: "ไหล่หลัง (Rear Delts)",
      equipmentType: "dumbbell",
      weightInstruction: "น้ำหนักต่อข้าง",
      notes: "นั่งโน้มตัวไปข้างหน้า อกแตะหรือเกือบแตะหน้าขา กางแขนออกข้างลำตัว บีบไหล่หลัง",
      isUnilateral: false,
    },
    {
      name: "Bulgarian Split Squats",
      thaiName: "สควอทขาเดียวพาดเก้าอี้",
      targetMuscle: "ขาเดี่ยว / ก้น (Quads / Glutes)",
      equipmentType: "dumbbell",
      weightInstruction: "น้ำหนักต่อข้าง หรือ Bodyweight",
      notes: "วางขาหลังพาดเก้าอี้ ย่อขาหน้าลง ลำตัวโน้มไปข้างหน้าเล็กน้อยเพื่อโฟกัสกล้ามเนื้อก้น",
      isUnilateral: true,
    },
    {
      name: "DB RDL",
      thaiName: "เดดลิฟต์เน้นหลังขาและก้น (Romanian Deadlift)",
      targetMuscle: "หลังขา / สะโพก (Hamstrings / Glutes)",
      equipmentType: "dumbbell",
      weightInstruction: "น้ำหนักต่อข้าง",
      notes: "พับสะโพกไปด้านหลัง ขางอเล็กน้อย หลังตรงตลอดการเคลื่อนไหว ยืดแฮมสตริงให้รู้สึกตึง",
      isUnilateral: false,
    },
    {
      name: "DB Goblet Squats",
      thaiName: "สควอทอุ้มดัมเบลแนบอก",
      targetMuscle: "ขารวม / Quads",
      equipmentType: "dumbbell",
      weightInstruction: "ใช้ 1 ดัมเบล จับ 2 มือ",
      notes: "อุ้มดัมเบลแนบอก สควอทลงลึก เข่าเปิดตามแนวปลายเท้า ลำตัวตรงและเกร็งหน้าท้อง",
      isUnilateral: false,
    },
    {
      name: "Dead Bugs",
      thaiName: "เกร็งหน้าท้องแกนกลาง",
      targetMuscle: "แกนกลางลำตัว (Core / Abs)",
      equipmentType: "bodyweight",
      weightInstruction: "Bodyweight",
      notes: "นอนหงาย หลังแนบชิดติดพื้นตลอดเวลา เหยียดแขนและขาสลับข้างกันช้าๆ โฟกัสเกร็งท้อง",
      isUnilateral: false,
    },
  ];

  const exerciseMap = new Map<string, string>();
  for (const ex of exercisesData) {
    const record = await prisma.exercise.upsert({
      where: { name: ex.name },
      update: ex,
      create: ex,
    });
    exerciseMap.set(ex.name, record.id);
  }
  console.log(`✅ Seeded ${exercisesData.length} exercises`);

  // 3. Routine: Repz Superset Routine
  const routineName = "Repz Weekly Superset Plan";
  let routine = await prisma.routine.findFirst({ where: { name: routineName } });
  if (!routine) {
    routine = await prisma.routine.create({
      data: {
        name: routineName,
        description: "ตารางโปรแกรมออกกำลังกาย Superset ประจำสัปดาห์ (Push / Pull / Legs & Core)",
      },
    });
  }

  // Workouts and Exercises configuration
  const workoutsPlan = [
    {
      name: "Push",
      thaiName: "วันจันทร์ & พฤหัสบดี: Push (อก / ไหล่ / หลังแขน)",
      splitCode: "PUSH",
      order: 1,
      exercises: [
        {
          exerciseName: "Decline Push-ups",
          supersetGroupId: "SS1",
          supersetName: "Superset 1: อกบน + ไหล่รวม",
          order: 1,
          targetSets: 3,
          targetRepsMin: 10,
          targetRepsMax: 15,
          defaultWeight: 0,
          notes: "เล่นท่านี้จบแล้วต่อด้วย Seated DB Shoulder Press ทันที",
        },
        {
          exerciseName: "Seated DB Shoulder Press",
          supersetGroupId: "SS1",
          supersetName: "Superset 1: อกบน + ไหล่รวม",
          order: 2,
          targetSets: 3,
          targetRepsMin: 8,
          targetRepsMax: 12,
          defaultWeight: 4.5,
          notes: "จบ 2 ท่า นับเป็น 1 เซ็ต แล้วพัก 60-90 วินาที",
        },
        {
          exerciseName: "Chair Dips",
          supersetGroupId: "SS2",
          supersetName: "Superset 2: หลังแขน + ไหล่ข้าง",
          order: 3,
          targetSets: 3,
          targetRepsMin: 12,
          targetRepsMax: 15,
          defaultWeight: 0,
          notes: "เล่นท่านี้จบแล้วต่อด้วย DB Lateral Raises ทันที",
        },
        {
          exerciseName: "DB Lateral Raises",
          supersetGroupId: "SS2",
          supersetName: "Superset 2: หลังแขน + ไหล่ข้าง",
          order: 4,
          targetSets: 3,
          targetRepsMin: 12,
          targetRepsMax: 15,
          defaultWeight: 3.0,
          notes: "จบ 2 ท่า นับเป็น 1 เซ็ต แล้วพัก 60-90 วินาที",
        },
      ],
    },
    {
      name: "Pull",
      thaiName: "วันอังคาร & ศุกร์: Pull (หลัง / หน้าแขน / ไหล่หลัง)",
      splitCode: "PULL",
      order: 2,
      exercises: [
        {
          exerciseName: "DB Bent-Over Rows",
          supersetGroupId: "SS1",
          supersetName: "Superset 1: หลังรวม + หน้าแขน",
          order: 1,
          targetSets: 3,
          targetRepsMin: 10,
          targetRepsMax: 12,
          defaultWeight: 6.0,
          notes: "เล่นท่านี้จบแล้วต่อด้วย DB Hammer Curls ทันที",
        },
        {
          exerciseName: "DB Hammer Curls",
          supersetGroupId: "SS1",
          supersetName: "Superset 1: หลังรวม + หน้าแขน",
          order: 2,
          targetSets: 3,
          targetRepsMin: 10,
          targetRepsMax: 12,
          defaultWeight: 4.5,
          notes: "จบ 2 ท่า นับเป็น 1 เซ็ต แล้วพัก 60-90 วินาที",
        },
        {
          exerciseName: "DB Pullover",
          supersetGroupId: "SS2",
          supersetName: "Superset 2: ปีก/อกขยาย + ไหล่หลัง",
          order: 3,
          targetSets: 3,
          targetRepsMin: 10,
          targetRepsMax: 12,
          defaultWeight: 6.0,
          notes: "เล่นท่านี้จบแล้วต่อด้วย Seated Rear Delt Flyes ทันที",
        },
        {
          exerciseName: "Seated Rear Delt Flyes",
          supersetGroupId: "SS2",
          supersetName: "Superset 2: ปีก/อกขยาย + ไหล่หลัง",
          order: 4,
          targetSets: 3,
          targetRepsMin: 12,
          targetRepsMax: 15,
          defaultWeight: 3.0,
          notes: "จบ 2 ท่า นับเป็น 1 เซ็ต แล้วพัก 60-90 วินาที",
        },
      ],
    },
    {
      name: "Legs & Core",
      thaiName: "วันพุธ: Legs & Core (ขา / ก้น / แกนกลางลำตัว)",
      splitCode: "LEGS_CORE",
      order: 3,
      exercises: [
        {
          exerciseName: "Bulgarian Split Squats",
          supersetGroupId: "SS1",
          supersetName: "Superset 1: ขาเดี่ยว/ก้น + หลังขา/สะโพก",
          order: 1,
          targetSets: 3,
          targetRepsMin: 8,
          targetRepsMax: 12,
          defaultWeight: 0,
          notes: "ทำซ้ายและขวา แล้วต่อด้วย DB RDL ทันที",
        },
        {
          exerciseName: "DB RDL",
          supersetGroupId: "SS1",
          supersetName: "Superset 1: ขาเดี่ยว/ก้น + หลังขา/สะโพก",
          order: 2,
          targetSets: 3,
          targetRepsMin: 10,
          targetRepsMax: 12,
          defaultWeight: 6.0,
          notes: "จบ 2 ท่า นับเป็น 1 เซ็ต แล้วพัก 60-90 วินาที",
        },
        {
          exerciseName: "DB Goblet Squats",
          supersetGroupId: "SS2",
          supersetName: "Superset 2: ขารวม + แกนกลางลำตัว",
          order: 3,
          targetSets: 3,
          targetRepsMin: 10,
          targetRepsMax: 15,
          defaultWeight: 7.5,
          notes: "เล่นท่านี้จบแล้วต่อด้วย Dead Bugs ทันที",
        },
        {
          exerciseName: "Dead Bugs",
          supersetGroupId: "SS2",
          supersetName: "Superset 2: ขารวม + แกนกลางลำตัว",
          order: 4,
          targetSets: 3,
          targetRepsMin: 12,
          targetRepsMax: 16,
          defaultWeight: 0,
          notes: "จบ 2 ท่า นับเป็น 1 เซ็ต แล้วพัก 60-90 วินาที",
        },
      ],
    },
  ];

  for (const wp of workoutsPlan) {
    let workout = await prisma.routineWorkout.findFirst({
      where: { routineId: routine.id, splitCode: wp.splitCode },
    });

    if (!workout) {
      workout = await prisma.routineWorkout.create({
        data: {
          routineId: routine.id,
          name: wp.name,
          thaiName: wp.thaiName,
          splitCode: wp.splitCode,
          order: wp.order,
        },
      });
    } else {
      await prisma.routineWorkout.update({
        where: { id: workout.id },
        data: { name: wp.name, thaiName: wp.thaiName, order: wp.order },
      });
    }

    // Upsert WorkoutExercises
    for (const we of wp.exercises) {
      const exerciseId = exerciseMap.get(we.exerciseName);
      if (!exerciseId) continue;

      const existingWE = await prisma.workoutExercise.findFirst({
        where: {
          routineWorkoutId: workout.id,
          exerciseId: exerciseId,
        },
      });

      if (existingWE) {
        await prisma.workoutExercise.update({
          where: { id: existingWE.id },
          data: {
            supersetGroupId: we.supersetGroupId,
            supersetName: we.supersetName,
            order: we.order,
            targetSets: we.targetSets,
            targetRepsMin: we.targetRepsMin,
            targetRepsMax: we.targetRepsMax,
            defaultWeight: we.defaultWeight,
            notes: we.notes,
          },
        });
      } else {
        await prisma.workoutExercise.create({
          data: {
            routineWorkoutId: workout.id,
            exerciseId: exerciseId,
            supersetGroupId: we.supersetGroupId,
            supersetName: we.supersetName,
            order: we.order,
            targetSets: we.targetSets,
            targetRepsMin: we.targetRepsMin,
            targetRepsMax: we.targetRepsMax,
            defaultWeight: we.defaultWeight,
            notes: we.notes,
          },
        });
      }
    }
  }

  console.log("✅ Seeded Routine & Workouts from workout_plan.md successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
