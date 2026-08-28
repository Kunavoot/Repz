import { getProgressData } from "@/actions/workout";
import { ProgressClient } from "@/components/progress/progress-client";

export const dynamic = "force-dynamic";

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ exerciseId?: string }>;
}) {
  const { exerciseId } = await searchParams;
  const data = await getProgressData(exerciseId);
  return <ProgressClient data={data} />;
}
