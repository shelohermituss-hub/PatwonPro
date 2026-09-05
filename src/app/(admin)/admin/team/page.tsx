import { fetchTeamMembers } from "@/lib/admin/queries/team";
import { TeamClient } from "./TeamClient";

export default async function TeamPage() {
  const team = await fetchTeamMembers();
  return <TeamClient team={team} />;
}
