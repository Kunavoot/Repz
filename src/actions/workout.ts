"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getCurrentUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to perform this action");
  }
  return session.user.id;
}

export async function startWorkoutSession(routineWorkoutId: string) {
  const userId = await getCurrentUserId();

  // Find the routine workout with exercises
  const routineWorkout = await prisma.routineWorkout.findUnique({
    where: { id: routineWorkoutId },
    include: {
      exercises: {
        include: {
          exercise: true,
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!routineWorkout) {
    throw new Error("Routine workout not found");
  }

  // Create new session
  const workoutSession = await prisma.workoutSession.create({
    data: {
      userId,
      routineWorkoutId,
      status: "IN_PROGRESS",
      startTime: new Date(),
    },
  });

  // For each exercise, look for previous session logs to pre-fill (Option A)
  for (const we of routineWorkout.exercises) {
    // Find the latest completed session that contained this exercise
    const previousLogs = await prisma.setLog.findMany({
      where: {
        exerciseId: we.exerciseId,
        completed: true,
        session: {
          userId,
          status: "COMPLETED",
        },
      },
      orderBy: { createdAt: "desc" },
      take: we.targetSets,
    });

    const setsToCreate = Math.max(we.targetSets, 3);
    for (let setIdx = 1; setIdx <= setsToCreate; setIdx++) {
      let defaultReps = we.targetRepsMin;
      let defaultWeight = we.defaultWeight ?? 0;

      // If we have previous logs, use matching set or most recent
      if (previousLogs.length > 0) {
        const matchingPrev = previousLogs.find((l) => l.setNumber === setIdx) || previousLogs[0];
        if (matchingPrev) {
          defaultReps = matchingPrev.reps > 0 ? matchingPrev.reps : defaultReps;
          defaultWeight = matchingPrev.weight >= 0 ? matchingPrev.weight : defaultWeight;
        }
      }

      await prisma.setLog.create({
        data: {
          sessionId: workoutSession.id,
          exerciseId: we.exerciseId,
          setNumber: setIdx,
          reps: defaultReps,
          weight: defaultWeight,
          completed: false,
        },
      });
    }
  }

  revalidatePath("/");
  return { sessionId: workoutSession.id };
}

export async function updateSetLog(
  setLogId: string,
  data: { reps?: number; weight?: number; completed?: boolean }
) {
  const userId = await getCurrentUserId();

  const existingLog = await prisma.setLog.findFirst({
    where: {
      id: setLogId,
      session: { userId },
    },
  });

  if (!existingLog) {
    throw new Error("Unauthorized or set log not found");
  }

  const updated = await prisma.setLog.update({
    where: { id: setLogId },
    data,
  });
  return updated;
}

export async function addSetLog(sessionId: string, exerciseId: string) {
  const userId = await getCurrentUserId();

  const session = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId },
  });

  if (!session) {
    throw new Error("Unauthorized or workout session not found");
  }

  // Count current sets
  const count = await prisma.setLog.count({
    where: { sessionId, exerciseId },
  });

  // Get last set's weight & reps
  const lastSet = await prisma.setLog.findFirst({
    where: { sessionId, exerciseId },
    orderBy: { setNumber: "desc" },
  });

  const newSet = await prisma.setLog.create({
    data: {
      sessionId,
      exerciseId,
      setNumber: count + 1,
      reps: lastSet?.reps ?? 10,
      weight: lastSet?.weight ?? 0,
      completed: false,
    },
  });

  return newSet;
}

export async function deleteSetLog(setLogId: string) {
  const userId = await getCurrentUserId();

  const existingLog = await prisma.setLog.findFirst({
    where: {
      id: setLogId,
      session: { userId },
    },
  });

  if (!existingLog) {
    throw new Error("Unauthorized or set log not found");
  }

  await prisma.setLog.delete({
    where: { id: setLogId },
  });
  return { success: true };
}

export async function finishWorkoutSession(sessionId: string, notes?: string) {
  const userId = await getCurrentUserId();

  const existingSession = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId },
  });

  if (!existingSession) {
    throw new Error("Unauthorized or workout session not found");
  }

  const session = await prisma.workoutSession.update({
    where: { id: sessionId },
    data: {
      endTime: new Date(),
      status: "COMPLETED",
      notes,
    },
    include: {
      setLogs: {
        where: { completed: true },
      },
    },
  });

  // Calculate total volume (kg * reps)
  const totalVolume = session.setLogs.reduce((acc, log) => acc + log.weight * log.reps, 0);
  const completedSets = session.setLogs.length;

  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath("/progress");

  return {
    sessionId: session.id,
    totalVolume,
    completedSets,
    durationMs: session.endTime && session.startTime ? session.endTime.getTime() - session.startTime.getTime() : 0,
  };
}

export async function getActiveWorkoutSession(sessionId: string) {
  const userId = await getCurrentUserId();

  const session = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId },
    include: {
      routineWorkout: {
        include: {
          exercises: {
            include: {
              exercise: true,
            },
            orderBy: { order: "asc" },
          },
        },
      },
      setLogs: {
        orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }],
      },
    },
  });

  return session;
}

export async function getDashboardData() {
  const userId = await getCurrentUserId();

  // Find all workouts
  const workouts = await prisma.routineWorkout.findMany({
    orderBy: { order: "asc" },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { order: "asc" },
      },
    },
  });

  // Find last completed session
  const lastSession = await prisma.workoutSession.findFirst({
    where: {
      userId,
      status: "COMPLETED",
    },
    orderBy: { endTime: "desc" },
    include: {
      routineWorkout: true,
      setLogs: { where: { completed: true } },
    },
  });

  // Determine next up workout
  let nextWorkout = workouts[0];
  if (lastSession && workouts.length > 0) {
    const lastIndex = workouts.findIndex((w) => w.id === lastSession.routineWorkoutId);
    const nextIndex = (lastIndex + 1) % workouts.length;
    nextWorkout = workouts[nextIndex];
  }

  // Active workout in progress?
  const activeSession = await prisma.workoutSession.findFirst({
    where: {
      userId,
      status: "IN_PROGRESS",
    },
    orderBy: { startTime: "desc" },
    include: {
      routineWorkout: true,
    },
  });

  // Recent 5 sessions
  const recentSessions = await prisma.workoutSession.findMany({
    where: { userId, status: "COMPLETED" },
    orderBy: { endTime: "desc" },
    take: 5,
    include: {
      routineWorkout: true,
      setLogs: {
        include: { exercise: true },
      },
    },
  });

  // Total completed workouts count this week
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const workoutsThisWeek = await prisma.workoutSession.count({
    where: {
      userId,
      status: "COMPLETED",
      endTime: { gte: startOfWeek },
    },
  });

  return {
    workouts,
    nextWorkout,
    lastSession,
    activeSession,
    recentSessions,
    workoutsThisWeek,
  };
}

export async function getHistoryData() {
  const userId = await getCurrentUserId();

  const history = await prisma.workoutSession.findMany({
    where: { userId, status: "COMPLETED" },
    orderBy: { endTime: "desc" },
    include: {
      routineWorkout: true,
      setLogs: {
        include: { exercise: true },
        orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }],
      },
    },
  });

  return history;
}

export async function getProgressData(selectedExerciseId?: string) {
  const userId = await getCurrentUserId();

  // All exercises
  const exercises = await prisma.exercise.findMany({
    orderBy: { name: "asc" },
  });

  const activeExId = selectedExerciseId || (exercises.length > 0 ? exercises[0].id : undefined);

  if (!activeExId) {
    return { exercises, activeExercise: null, chartData: [], stats: null };
  }

  const activeExercise = exercises.find((e) => e.id === activeExId) || exercises[0];

  // Fetch all completed set logs for this exercise ordered by session date
  const setLogs = await prisma.setLog.findMany({
    where: {
      exerciseId: activeExId,
      completed: true,
      session: {
        userId,
        status: "COMPLETED",
      },
    },
    include: {
      session: true,
    },
    orderBy: {
      session: { startTime: "asc" },
    },
  });

  // Group by session to calculate Max Weight & Total Volume per workout session
  const sessionMap = new Map<string, { date: string; maxWeight: number; totalVolume: number; totalReps: number }>();

  for (const log of setLogs) {
    const sessionId = log.sessionId;
    const dateStr = log.session.startTime.toLocaleDateString("th-TH", {
      month: "short",
      day: "numeric",
    });

    const current = sessionMap.get(sessionId) || {
      date: dateStr,
      maxWeight: 0,
      totalVolume: 0,
      totalReps: 0,
    };

    current.maxWeight = Math.max(current.maxWeight, log.weight);
    current.totalVolume += log.weight * log.reps;
    current.totalReps += log.reps;
    sessionMap.set(sessionId, current);
  }

  const chartData = Array.from(sessionMap.values());

  const allMaxWeight = chartData.length > 0 ? Math.max(...chartData.map((d) => d.maxWeight)) : 0;
  const totalSetsCompleted = setLogs.length;

  return {
    exercises,
    activeExercise,
    chartData,
    stats: {
      maxWeightAllTime: allMaxWeight,
      totalSetsCompleted,
      totalSessions: chartData.length,
    },
  };
}

export async function getHistoricalPRs(exerciseIds: string[]) {
  const userId = await getCurrentUserId();

  const prs = await prisma.setLog.groupBy({
    by: ['exerciseId'],
    where: {
      exerciseId: { in: exerciseIds },
      completed: true,
      session: {
        userId,
        status: "COMPLETED",
      },
    },
    _max: {
      weight: true,
      reps: true,
    },
  });

  const result: Record<string, { maxWeight: number; maxReps: number }> = {};
  for (const pr of prs) {
    result[pr.exerciseId] = {
      maxWeight: pr._max.weight ?? 0,
      maxReps: pr._max.reps ?? 0,
    };
  }

  return result;
}

