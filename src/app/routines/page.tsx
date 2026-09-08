import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserRoutines, getExercisesList } from "@/actions/custom-routine";
import { RoutinesManagementClient } from "@/components/routines/routines-management-client";

export const dynamic = "force-dynamic";

export default async function RoutinesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/routines");
  }

  const [{ routines, activeRoutineId }, exercises] = await Promise.all([
    getUserRoutines(),
    getExercisesList(),
  ]);

  return (
    <RoutinesManagementClient
      initialRoutines={routines}
      initialExercises={exercises}
      activeRoutineId={activeRoutineId}
    />
  );
}
