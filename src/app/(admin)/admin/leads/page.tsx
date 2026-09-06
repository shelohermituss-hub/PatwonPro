import { fetchLeads } from "@/lib/admin/queries/leads";
import { fetchStoreOptions } from "@/lib/admin/queries/stores";
import { LeadsClient } from "./LeadsClient";
import { requireNavAccess } from "@/lib/admin/guardNav";

export default async function LeadsPage() {
  await requireNavAccess("leads");
  const [leads, storeOptions] = await Promise.all([fetchLeads(), fetchStoreOptions()]);
  return <LeadsClient leads={leads} storeOptions={storeOptions} />;
}
