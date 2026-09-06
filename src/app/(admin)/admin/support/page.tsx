import { fetchAdminSupportTickets } from "@/lib/admin/queries/support";
import { fetchTeamOptions } from "@/lib/admin/queries/team";
import { SupportClient } from "./SupportClient";
import { requireNavAccess } from "@/lib/admin/guardNav";

export default async function SupportPage() {
  await requireNavAccess("support");
  const [tickets, agentOptions] = await Promise.all([fetchAdminSupportTickets(), fetchTeamOptions()]);
  return <SupportClient tickets={tickets} agentOptions={agentOptions} />;
}
