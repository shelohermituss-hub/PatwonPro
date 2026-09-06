import { fetchTeamMembers } from "@/lib/admin/queries/team";
import { TeamClient } from "./TeamClient";
import { requireNavAccess } from "@/lib/admin/guardNav";

export default async function TeamPage() {
  await requireNavAccess("team");
  const team = await fetchTeamMembers();
  return <TeamClient team={team} />;
}
