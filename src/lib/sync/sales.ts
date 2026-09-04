import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/client";
import { nextRetryDelay } from "./backoff";

/**
 * Pushes every locally-recorded sale that hasn't reached Supabase yet.
 * Sale ids are client-generated UUIDs, so a retried push is idempotent
 * (upsert on primary key) rather than creating duplicates. Sales that
 * failed recently are skipped until their backoff window elapses.
 */
export async function syncPendingSales() {
  const now = Date.now();
  const pending = (
    await db.sales.where("sync_status").equals("pending").toArray()
  ).filter((sale) => !sale.next_sync_at || new Date(sale.next_sync_at).getTime() <= now);

  if (pending.length === 0) return { synced: 0, failed: 0 };

  const supabase = createClient();
  let synced = 0;
  let failed = 0;

  for (const sale of pending) {
    const items = await db.saleItems.where("sale_id").equals(sale.id).toArray();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- dropping Dexie-only fields
    const { sync_status, sync_attempts, next_sync_at, ...saleRecord } = sale;

    const { error: saleError } = await supabase.from("sales").upsert(saleRecord);
    const { error: itemsError } = saleError
      ? { error: saleError }
      : await supabase.from("sale_items").upsert(items);

    if (saleError || itemsError) {
      failed += 1;
      const attempts = (sale.sync_attempts ?? 0) + 1;
      await db.sales.update(sale.id, {
        sync_attempts: attempts,
        next_sync_at: new Date(now + nextRetryDelay(attempts)).toISOString(),
      });
      continue;
    }

    await db.sales.update(sale.id, {
      sync_status: "synced",
      sync_attempts: 0,
      next_sync_at: null,
    });
    synced += 1;
  }

  return { synced, failed };
}
