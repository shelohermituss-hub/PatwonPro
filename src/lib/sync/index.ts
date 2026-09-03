import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/client";

/**
 * Pushes every locally-recorded sale that hasn't reached Supabase yet.
 * Sale ids are client-generated UUIDs, so a retried push is idempotent
 * (upsert on primary key) rather than creating duplicates.
 */
export async function syncPendingSales() {
  const pending = await db.sales.where("sync_status").equals("pending").toArray();
  if (pending.length === 0) return { synced: 0, failed: 0 };

  const supabase = createClient();
  let synced = 0;
  let failed = 0;

  for (const sale of pending) {
    const items = await db.saleItems.where("sale_id").equals(sale.id).toArray();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- dropping the Dexie-only field
    const { sync_status, ...saleRecord } = sale;

    const { error: saleError } = await supabase.from("sales").upsert(saleRecord);
    const { error: itemsError } = saleError
      ? { error: saleError }
      : await supabase.from("sale_items").upsert(items);

    if (saleError || itemsError) {
      failed += 1;
      continue;
    }

    await db.sales.update(sale.id, { sync_status: "synced" });
    synced += 1;
  }

  return { synced, failed };
}

/**
 * Registers listeners so a pending sync is attempted as soon as the device
 * comes back online. Call once from a client-side layout/provider.
 */
export function registerSyncListeners() {
  if (typeof window === "undefined") return;

  window.addEventListener("online", () => {
    void syncPendingSales();
  });
}
