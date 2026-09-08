import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getRoutineDetail, getExercisesList } from "@/actions/custom-routine";
import { RoutineBuilder } from "@/components/routines/routine-builder";

export const dynamic = "force-dynamic";

interface EditRoutinePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRoutinePage({ params }: EditRoutinePageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/routines");
  }

  const { id } = await params;

  let routine;
  let exercises;

  try {
    [routine, exercises] = await Promise.all([
      getRoutineDetail(id),
      getExercisesList(),
    ]);
  } catch {
    notFound();
  }

  return <RoutineBuilder initialRoutine={routine} allExercises={exercises} />;
}
