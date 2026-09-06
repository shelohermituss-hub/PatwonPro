import { fetchLeads } from "@/lib/admin/queries/leads";
import { TrialsClient } from "./TrialsClient";
import { requireNavAccess } from "@/lib/admin/guardNav";

export default async function TrialsPage() {
  await requireNavAccess("trials");
  const leads = await fetchLeads();
  const activeTrials = leads.filter((l) => l.stage === "trial_active" || l.stage === "trial_installed");
  return <TrialsClient activeTrials={activeTrials} />;
}
