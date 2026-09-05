import { fetchInstallations } from "@/lib/admin/queries/installations";
import { fetchTeamOptions } from "@/lib/admin/queries/team";
import { fetchAdminDevices } from "@/lib/admin/queries/devices";
import { InstallationsClient } from "./InstallationsClient";

export default async function InstallationsPage() {
  const [installations, agentOptions, devices] = await Promise.all([
    fetchInstallations(),
    fetchTeamOptions(),
    fetchAdminDevices(),
  ]);

  const deviceOptions = devices.map((d) => ({ id: d.dbId, label: `${d.id} — ${d.brand} ${d.model}` }));

  return <InstallationsClient installations={installations} agentOptions={agentOptions} deviceOptions={deviceOptions} />;
}
