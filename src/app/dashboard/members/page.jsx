import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import MembersPage from "@/components/members/MembersPage";

export default async function Members() {
  const user = await getCurrentUser();
  if (user?.role === "member") redirect("/dashboard");
  return <MembersPage user={user} />;
}
