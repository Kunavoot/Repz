"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getCurrentUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to perform this action");
  }
  return session.user.id;
}

// -------------------------------------------------------------
// EXERCISE MANAGEMENT ACTIONS
// -------------------------------------------------------------

export async function getExercisesList() {
  const userId = await getCurrentUserId();

  const exercises = await prisma.exercise.findMany({
    where: {
      OR: [{ userId: null }, { userId }],
    },
    orderBy: [{ targetMuscle: "asc" }, { name: "asc" }],
  });

  return exercises.map((e) => ({
    ...e,
    isCustom: e.userId !== null,
  }));
}

export interface CustomExerciseInput {
  name: string;
  thaiName?: string;
  targetMuscle: string;
  equipmentType: string;
  isUnilateral?: boolean;
  weightInstruction?: string;
  notes?: string;
}

export async function createCustomExercise(input: CustomExerciseInput) {
  const userId = await getCurrentUserId();

  if (!input.name.trim()) {
    throw new Error("กรุณากรอกชื่อท่าออกกำลังกาย (Name is required)");
  }

  const newExercise = await prisma.exercise.create({
    data: {
      userId,
      name: input.name.trim(),
      thaiName: input.thaiName?.trim() || null,
      targetMuscle: input.targetMuscle,
      equipmentType: input.equipmentType,
      isUnilateral: !!input.isUnilateral,
      weightInstruction: input.weightInstruction?.trim() || null,
      notes: input.notes?.trim() || null,
    },
  });

  revalidatePath("/routines");
  revalidatePath("/dashboard");
  return { success: true, exercise: newExercise };
}

export async function updateCustomExercise(id: string, input: CustomExerciseInput) {
  const userId = await getCurrentUserId();

  const existing = await prisma.exercise.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("ไม่พบท่าออกกำลังกายนี้");
  }

  if (existing.userId !== userId) {
    throw new Error("ไม่สามารถแก้ไขท่ามาตรฐานของระบบได้ (Preset cannot be modified directly)");
  }

  const updated = await prisma.exercise.update({
    where: { id },
    data: {
      name: input.name.trim(),
      thaiName: input.thaiName?.trim() || null,
      targetMuscle: input.targetMuscle,
      equipmentType: input.equipmentType,
      isUnilateral: !!input.isUnilateral,
      weightInstruction: input.weightInstruction?.trim() || null,
      notes: input.notes?.trim() || null,
    },
  });

  revalidatePath("/routines");
  revalidatePath("/dashboard");
  return { success: true, exercise: updated };
}

export async function deleteCustomExercise(id: string) {
  const userId = await getCurrentUserId();

  const existing = await prisma.exercise.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("ไม่พบท่าออกกำลังกายนี้");
  }

  if (existing.userId !== userId) {
    throw new Error("ไม่สามารถลบท่ามาตรฐานของระบบได้");
  }

  // Check if linked to any workout exercise or set log
  const countUsage = await prisma.workoutExercise.count({ where: { exerciseId: id } });
  const countLogs = await prisma.setLog.count({ where: { exerciseId: id } });

  if (countUsage > 0 || countLogs > 0) {
    throw new Error("ไม่สามารถลบท่านี้ได้เนื่องจากมีการใช้งานในตารางฝึกหรือมีประวัติการเล่นแล้ว");
  }

  await prisma.exercise.delete({
    where: { id },
  });

  revalidatePath("/routines");
  return { success: true };
}

// -------------------------------------------------------------
// ROUTINE MANAGEMENT ACTIONS
// -------------------------------------------------------------

export async function getUserRoutines() {
  const userId = await getCurrentUserId();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { activeRoutineId: true },
  });

  const routines = await prisma.routine.findMany({
    where: {
      OR: [{ userId: null }, { userId }],
    },
    include: {
      workouts: {
        orderBy: { order: "asc" },
        include: {
          exercises: {
            include: {
              exercise: true,
            },
            orderBy: { order: "asc" },
          },
        },
      },
    },
    orderBy: [{ createdAt: "desc" }],
  });

  return {
    activeRoutineId: user?.activeRoutineId || routines[0]?.id || null,
    routines: routines.map((r) => ({
      ...r,
      isPreset: r.userId === null,
      isCustom: r.userId === userId,
      isActive: r.id === (user?.activeRoutineId || routines[0]?.id),
    })),
  };
}

export async function setActiveRoutine(routineId: string) {
  const userId = await getCurrentUserId();

  // Validate routine exists
  const routine = await prisma.routine.findFirst({
    where: {
      id: routineId,
      OR: [{ userId: null }, { userId }],
    },
  });

  if (!routine) {
    throw new Error("ไม่พบตารางฝึกนี้ในระบบ");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { activeRoutineId: routineId },
  });

  revalidatePath("/dashboard");
  revalidatePath("/routines");
  return { success: true };
}

export async function getRoutineDetail(routineId: string) {
  const userId = await getCurrentUserId();

  const routine = await prisma.routine.findFirst({
    where: {
      id: routineId,
      OR: [{ userId: null }, { userId }],
    },
    include: {
      workouts: {
        orderBy: { order: "asc" },
        include: {
          exercises: {
            include: {
              exercise: true,
            },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!routine) {
    throw new Error("ไม่พบตารางฝึกนี้");
  }

  return {
    ...routine,
    isPreset: routine.userId === null,
    isCustom: routine.userId === userId,
  };
}

export interface WorkoutExerciseInput {
  exerciseId: string;
  order: number;
  supersetGroupId?: string | null;
  supersetName?: string | null;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  defaultWeight?: number | null;
  notes?: string | null;
}

export interface RoutineWorkoutInput {
  id?: string;
  name: string;
  thaiName?: string | null;
  splitCode: string;
  order: number;
  exercises: WorkoutExerciseInput[];
}

export interface RoutineFormInput {
  name: string;
  description?: string | null;
  workouts: RoutineWorkoutInput[];
}

export async function createCustomRoutine(input: RoutineFormInput) {
  const userId = await getCurrentUserId();

  if (!input.name.trim()) {
    throw new Error("กรุณากรอกชื่อตารางฝึก");
  }

  if (!input.workouts || input.workouts.length === 0) {
    throw new Error("กรุณาเพิ่มวันฝึกอย่างน้อย 1 วัน");
  }

  const routine = await prisma.routine.create({
    data: {
      userId,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      workouts: {
        create: input.workouts.map((w, wIdx) => ({
          name: w.name.trim() || `Day ${wIdx + 1}`,
          thaiName: w.thaiName?.trim() || null,
          splitCode: w.splitCode || "CUSTOM",
          order: wIdx + 1,
          exercises: {
            create: w.exercises.map((e, eIdx) => ({
              exerciseId: e.exerciseId,
              order: eIdx + 1,
              supersetGroupId: e.supersetGroupId || null,
              supersetName: e.supersetName || null,
              targetSets: Number(e.targetSets) || 3,
              targetRepsMin: Number(e.targetRepsMin) || 10,
              targetRepsMax: Number(e.targetRepsMax) || 12,
              defaultWeight: e.defaultWeight !== undefined && e.defaultWeight !== null ? Number(e.defaultWeight) : 0,
              notes: e.notes?.trim() || null,
            })),
          },
        })),
      },
    },
  });

  // Automatically activate this routine for the user
  await prisma.user.update({
    where: { id: userId },
    data: { activeRoutineId: routine.id },
  });

  revalidatePath("/dashboard");
  revalidatePath("/routines");
  return { success: true, routineId: routine.id };
}

export async function updateCustomRoutine(routineId: string, input: RoutineFormInput) {
  const userId = await getCurrentUserId();

  const existing = await prisma.routine.findUnique({
    where: { id: routineId },
    include: { workouts: true },
  });

  if (!existing) {
    throw new Error("ไม่พบตารางฝึกนี้");
  }

  // If this is a System Preset (userId is null), clone it into a new Custom Routine instead!
  if (existing.userId === null) {
    return createCustomRoutine({
      ...input,
      name: `${input.name.trim()} (สำเนาของฉัน)`,
    });
  }

  // Ensure user owns this custom routine
  if (existing.userId !== userId) {
    throw new Error("คุณไม่มีสิทธิ์แก้ไขตารางฝึกนี้");
  }

  // Update routine with transaction: delete old workouts/exercises and recreate
  await prisma.$transaction(async (tx) => {
    // Delete existing workouts (cascade deletes workoutExercises)
    await tx.routineWorkout.deleteMany({
      where: { routineId },
    });

    // Update routine main info and recreate workouts
    await tx.routine.update({
      where: { id: routineId },
      data: {
        name: input.name.trim(),
        description: input.description?.trim() || null,
        workouts: {
          create: input.workouts.map((w, wIdx) => ({
            name: w.name.trim() || `Day ${wIdx + 1}`,
            thaiName: w.thaiName?.trim() || null,
            splitCode: w.splitCode || "CUSTOM",
            order: wIdx + 1,
            exercises: {
              create: w.exercises.map((e, eIdx) => ({
                exerciseId: e.exerciseId,
                order: eIdx + 1,
                supersetGroupId: e.supersetGroupId || null,
                supersetName: e.supersetName || null,
                targetSets: Number(e.targetSets) || 3,
                targetRepsMin: Number(e.targetRepsMin) || 10,
                targetRepsMax: Number(e.targetRepsMax) || 12,
                defaultWeight: e.defaultWeight !== undefined && e.defaultWeight !== null ? Number(e.defaultWeight) : 0,
                notes: e.notes?.trim() || null,
              })),
            },
          })),
        },
      },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/routines");
  return { success: true, routineId };
}

export async function cloneRoutine(routineId: string) {
  const userId = await getCurrentUserId();

  const routine = await prisma.routine.findFirst({
    where: {
      id: routineId,
      OR: [{ userId: null }, { userId }],
    },
    include: {
      workouts: {
        orderBy: { order: "asc" },
        include: {
          exercises: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!routine) {
    throw new Error("ไม่พบตารางฝึกที่ต้องการคัดลอก");
  }

  const cloned = await prisma.routine.create({
    data: {
      userId,
      name: `${routine.name} (สำเนา)`,
      description: routine.description,
      workouts: {
        create: routine.workouts.map((w) => ({
          name: w.name,
          thaiName: w.thaiName,
          splitCode: w.splitCode,
          order: w.order,
          exercises: {
            create: w.exercises.map((e) => ({
              exerciseId: e.exerciseId,
              order: e.order,
              supersetGroupId: e.supersetGroupId,
              supersetName: e.supersetName,
              targetSets: e.targetSets,
              targetRepsMin: e.targetRepsMin,
              targetRepsMax: e.targetRepsMax,
              defaultWeight: e.defaultWeight,
              notes: e.notes,
            })),
          },
        })),
      },
    },
  });

  // Automatically activate the cloned routine
  await prisma.user.update({
    where: { id: userId },
    data: { activeRoutineId: cloned.id },
  });

  revalidatePath("/dashboard");
  revalidatePath("/routines");
  return { success: true, routineId: cloned.id };
}

export async function deleteCustomRoutine(routineId: string) {
  const userId = await getCurrentUserId();

  const existing = await prisma.routine.findUnique({
    where: { id: routineId },
  });

  if (!existing) {
    throw new Error("ไม่พบตารางฝึกนี้");
  }

  if (existing.userId !== userId) {
    throw new Error("ไม่สามารถลบตารางฝึกมาตรฐานของระบบได้");
  }

  // Check if user has active sessions tied to this routine's workouts
  const activeSessions = await prisma.workoutSession.count({
    where: {
      userId,
      routineWorkout: { routineId },
    },
  });

  if (activeSessions > 0) {
    // If they have completed history sessions, we can keep the routine or prevent deletion
    // Rather than deleting sessions, advise or disconnect
  }

  await prisma.routine.delete({
    where: { id: routineId },
  });

  // If user had this as activeRoutineId, reset it
  await prisma.user.updateMany({
    where: { id: userId, activeRoutineId: routineId },
    data: { activeRoutineId: null },
  });

  revalidatePath("/dashboard");
  revalidatePath("/routines");
  return { success: true };
}
