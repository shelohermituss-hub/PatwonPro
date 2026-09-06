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

/**
 * Appends a `{date, issue, cost}` entry to `repair_history` and flips
 * status to "repair" — read-then-write, so two repairs logged on the
 * same device at the exact same instant could clobber each other; an
 * acceptable tradeoff given this is a single-admin, low-frequency action.
 */
export async function logDeviceRepair(deviceDbId: string, entry: { issue: string; cost: number }) {
  const supabase = createClient();
  const { data: current, error: readError } = await supabase
    .from("devices")
    .select("repair_history")
    .eq("id", deviceDbId)
    .single();
  if (readError) throw new Error(readError.message);

  const history = Array.isArray(current?.repair_history) ? current.repair_history : [];
  const { error } = await supabase
    .from("devices")
    .update({
      status: "repair",
      repair_history: [...history, { date: new Date().toISOString(), issue: entry.issue, cost: entry.cost }],
    })
    .eq("id", deviceDbId);
  if (error) throw new Error(error.message);
}

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

export interface AssignDeviceDepositInput {
  amountHtg: number;
  paymentMode: "lump_sum" | "monthly_installment";
  monthlyInstallmentHtg: number | null;
}

/**
 * Assigns an in-stock/reserved device to a store, marking it deployed,
 * and creates the tablet's security deposit ("kosyon") at the same
 * time — until now these were two disconnected admin actions, leaving
 * every assigned tablet with no deposit for the merchant to ever pay.
 * Only creates one if the device has no non-terminal deposit already
 * (a device reassigned after a previous stint keeps its old
 * refunded/fully_retained history instead of duplicating it).
 */
export async function assignDeviceToStore(
  deviceDbId: string,
  storeId: string,
  deposit: AssignDeviceDepositInput,
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("devices")
    .update({ store_id: storeId, status: "deployed_active", installed_at: new Date().toISOString().slice(0, 10) })
    .eq("id", deviceDbId);
  if (error) throw new Error(error.message);

  const { data: existing, error: existingError } = await supabase
    .from("deposits")
    .select("id")
    .eq("device_id", deviceDbId)
    .neq("status", "refunded")
    .neq("status", "fully_retained")
    .maybeSingle();
  if (existingError) throw new Error(existingError.message);
  if (existing) return;

  const { error: depositError } = await supabase.from("deposits").insert({
    store_id: storeId,
    device_id: deviceDbId,
    amount_htg: deposit.amountHtg,
    payment_mode: deposit.paymentMode,
    monthly_installment_htg: deposit.paymentMode === "monthly_installment" ? deposit.monthlyInstallmentHtg : null,
    status: "pending",
  });
  if (depositError) throw new Error(depositError.message);
}

/**
 * Returns a device to stock — the reverse of `assignDeviceToStore`.
 * Never touches the linked `deposits` row: refund eligibility is a
 * separate admin decision made through the existing /admin/deposits
 * workflow, at whatever pace fits the tablet's actual condition.
 */
export async function unassignDeviceFromStore(deviceDbId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("devices")
    .update({ store_id: null, status: "in_stock", installed_at: null })
    .eq("id", deviceDbId);
  if (error) throw new Error(error.message);
}
