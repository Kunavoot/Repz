import { notFound } from "next/navigation";
import { getActiveWorkoutSession } from "@/actions/workout";
import { ActiveWorkoutClient } from "@/components/workout/active-workout-client";

export const dynamic = "force-dynamic";

export default async function WorkoutSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const session = await getActiveWorkoutSession(sessionId);

  if (!session) {
    notFound();
  }

  return <ActiveWorkoutClient initialSession={session} />;
}
