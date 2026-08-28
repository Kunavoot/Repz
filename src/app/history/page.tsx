import { getHistoryData } from "@/actions/workout";
import { HistoryClient } from "@/components/history/history-client";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const history = await getHistoryData();
  return <HistoryClient history={history} />;
}
