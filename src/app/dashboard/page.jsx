import { getCurrentUser } from "@/lib/auth";
import DashboardOverview from "@/components/dashboard/DashboardOverview";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  return <DashboardOverview user={user} />;
}
