import { getDashboardData } from "@/actions/workout";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const data = await getDashboardData();
  return <DashboardClient data={data} />;
}
