import { getProgressData } from "@/actions/workout";
import { ProgressClient } from "@/components/progress/progress-client";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ exerciseId?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/progress");
  }

  const { exerciseId } = await searchParams;
  const data = await getProgressData(exerciseId);
  return <ProgressClient data={data} />;
}

