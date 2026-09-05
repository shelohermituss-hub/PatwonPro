import { fetchLeads } from "@/lib/admin/queries/leads";
import { TrialsClient } from "./TrialsClient";

export default async function TrialsPage() {
  const leads = await fetchLeads();
  const activeTrials = leads.filter((l) => l.stage === "trial_active" || l.stage === "trial_installed");
  return <TrialsClient activeTrials={activeTrials} />;
}
