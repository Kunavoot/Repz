import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getExercisesList } from "@/actions/custom-routine";
import { RoutineBuilder } from "@/components/routines/routine-builder";

export const dynamic = "force-dynamic";

export default async function NewRoutinePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/routines/new");
  }

  const exercises = await getExercisesList();

  return <RoutineBuilder allExercises={exercises} />;
}
