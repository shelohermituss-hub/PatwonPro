import { createClient } from "@/lib/supabase/server";
import type { SyncHealthRow } from "@/types/admin";

interface DeviceRow {
  device_code: string;
  store_id: string | null;
  last_seen_at: string | null;
  pending_actions: number;
  sync_errors: number;
  store: { name: string } | { name: string }[] | null;
}

/** One row per device assigned to a store — devices with no store yet (in-stock inventory) have no sync health to report. */
export async function fetchSyncHealth(): Promise<SyncHealthRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("devices")
    .select("device_code, store_id, last_seen_at, pending_actions, sync_errors, store:stores(name)")
    .not("store_id", "is", null);

  if (error) {
    throw new Error(`Pa t kapab chaje sante sync la: ${error.message}`);
  }

  return ((data ?? []) as DeviceRow[])
    .filter((row): row is DeviceRow & { store_id: string } => row.store_id !== null)
    .map((row) => {
      const store = Array.isArray(row.store) ? row.store[0] : row.store;
      return {
        storeId: row.store_id,
        storeName: store?.name ?? "—",
        deviceId: row.device_code,
        lastSyncAt: row.last_seen_at,
        pendingActions: row.pending_actions,
        errors: row.sync_errors,
        conflicts: 0,
      };
    });
}
