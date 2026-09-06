import { fetchSyncHealth } from "@/lib/admin/queries/sync";
import { SyncClient } from "./SyncClient";
import { requireNavAccess } from "@/lib/admin/guardNav";

export default async function SyncPage() {
  await requireNavAccess("sync");
  const rows = await fetchSyncHealth();
  return <SyncClient rows={rows} />;
}
