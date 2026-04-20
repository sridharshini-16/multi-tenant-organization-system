import { getCurrentUser } from "@/lib/auth";
import TasksPage from "@/components/tasks/TasksPage";

export const dynamic = "force-dynamic";

export default async function Tasks() {
  const user = await getCurrentUser();
  return <TasksPage user={user} />;
}
