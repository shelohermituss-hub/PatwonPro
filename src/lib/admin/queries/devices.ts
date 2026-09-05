import { createClient } from "@/lib/supabase/server";
import type { AdminDevice, DeviceRepairEntry } from "@/types/admin";

interface DeviceRow {
  id: string;
  device_code: string;
  serial_number: string | null;
  brand: string | null;
  model: string | null;
  import_batch: string | null;
  actual_cost_htg: number | null;
  purchase_date: string | null;
  status: string;
  store_id: string | null;
  contract_number: string | null;
  last_seen_at: string | null;
  repair_history: DeviceRepairEntry[] | null;
  photo_count: number;
  installed_at: string | null;
  returned_at: string | null;
  store: { name: string } | { name: string }[] | null;
}

export async function fetchAdminDevices(): Promise<AdminDevice[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("devices")
    .select("*, store:stores(name)")
    .order("device_code");

  if (error) {
    throw new Error(`Pa t kapab chaje aparèy yo: ${error.message}`);
  }

  return ((data ?? []) as DeviceRow[]).map((row) => {
    const store = Array.isArray(row.store) ? row.store[0] : row.store;
    return {
      id: row.device_code,
      dbId: row.id,
      serialNumber: row.serial_number ?? "—",
      brand: row.brand ?? "—",
      model: row.model ?? "—",
      importBatch: row.import_batch ?? "—",
      actualCostHtg: row.actual_cost_htg ?? 0,
      purchaseDate: row.purchase_date ?? "",
      status: row.status as AdminDevice["status"],
      assignedStoreId: row.store_id,
      assignedStoreName: store?.name ?? null,
      contractNumber: row.contract_number,
      depositId: null,
      lastSyncAt: row.last_seen_at,
      repairHistory: row.repair_history ?? [],
      photoCount: row.photo_count,
      installedAt: row.installed_at,
      returnedAt: row.returned_at,
    };
  });
}
