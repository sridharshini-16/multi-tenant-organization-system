import { getCurrentUser } from "@/lib/auth";
import EventsPage from "@/components/events/EventsPage";

export const dynamic = "force-dynamic";

export default async function Events() {
  const user = await getCurrentUser();
  return <EventsPage user={user} />;
}
