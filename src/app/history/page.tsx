import { getHistoryData } from "@/actions/workout";
import { HistoryClient } from "@/components/history/history-client";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/history");
  }

  const history = await getHistoryData();
  return <HistoryClient history={history} />;
}

