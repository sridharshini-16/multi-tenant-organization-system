import { getCurrentUser } from "@/lib/auth";
import EventsPage from "@/components/events/EventsPage";

export default async function Events() {
  const user = await getCurrentUser();
  return <EventsPage user={user} />;
}
