import { fetchLeads } from "@/lib/admin/queries/leads";
import { fetchStoreOptions } from "@/lib/admin/queries/stores";
import { LeadsClient } from "./LeadsClient";

export default async function LeadsPage() {
  const [leads, storeOptions] = await Promise.all([fetchLeads(), fetchStoreOptions()]);
  return <LeadsClient leads={leads} storeOptions={storeOptions} />;
}
