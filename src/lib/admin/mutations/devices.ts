import { createClient } from "@/lib/supabase/client";
import type { DeviceBatchFormOutput } from "@/lib/validations/device";

async function setStatus(deviceDbId: string, status: string) {
  const supabase = createClient();
  const { error } = await supabase.from("devices").update({ status }).eq("id", deviceDbId);
  if (error) throw new Error(error.message);
}

export const markDeviceReady = (deviceDbId: string) => setStatus(deviceDbId, "in_stock");
export const reserveDevice = (deviceDbId: string) => setStatus(deviceDbId, "reserved");
export const reportDeviceLost = (deviceDbId: string) => setStatus(deviceDbId, "lost");
export const logDeviceRepair = (deviceDbId: string) => setStatus(deviceDbId, "repair");

/**
 * Registers a tablet model in one go: inserts `quantity` rows sharing
 * the same brand/model/photo, each `in_stock` and unassigned
 * (`device_code` is generated per-row by the DB default, migration 013).
 */
export async function createDeviceBatch(input: DeviceBatchFormOutput & { modelPhotoUrl: string | null }) {
  const supabase = createClient();

  const rows = Array.from({ length: input.quantity }, () => ({
    brand: input.brand,
    model: input.model,
    model_photo_url: input.modelPhotoUrl,
    import_batch: input.importBatch || null,
    actual_cost_htg: input.actualCostHtg ?? null,
    purchase_date: input.purchaseDate || null,
    status: "in_stock",
  }));

  const { error } = await supabase.from("devices").insert(rows);
  if (error) throw new Error(error.message);
}

/** Assigns an in-stock/reserved device to a store, marking it deployed. */
export async function assignDeviceToStore(deviceDbId: string, storeId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("devices")
    .update({ store_id: storeId, status: "deployed_active", installed_at: new Date().toISOString().slice(0, 10) })
    .eq("id", deviceDbId);
  if (error) throw new Error(error.message);
}
