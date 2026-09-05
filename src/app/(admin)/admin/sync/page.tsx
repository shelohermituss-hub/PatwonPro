import { fetchSyncHealth } from "@/lib/admin/queries/sync";
import { SyncClient } from "./SyncClient";

export default async function SyncPage() {
  const rows = await fetchSyncHealth();
  return <SyncClient rows={rows} />;
}
