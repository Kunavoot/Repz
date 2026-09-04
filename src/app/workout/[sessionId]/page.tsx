import { notFound, redirect } from "next/navigation";
import { getActiveWorkoutSession } from "@/actions/workout";
import { ActiveWorkoutClient } from "@/components/workout/active-workout-client";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function WorkoutSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const userSession = await auth();
  if (!userSession?.user) {
    redirect(`/login?callbackUrl=/workout/${sessionId}`);
  }

  const session = await getActiveWorkoutSession(sessionId);

  if (!session || session.userId !== userSession.user.id) {
    notFound();
  }

  return <ActiveWorkoutClient initialSession={session} />;
}

