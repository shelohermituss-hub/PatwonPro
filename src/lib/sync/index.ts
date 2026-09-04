import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/client";

const BASE_DELAY_MS = 5_000;
const MAX_DELAY_MS = 5 * 60_000;
const BACKGROUND_INTERVAL_MS = 20_000;

/** Exponential backoff, capped, with jitter to avoid every tab retrying in lockstep. */
function nextRetryDelay(attempts: number) {
  const delay = Math.min(BASE_DELAY_MS * 2 ** attempts, MAX_DELAY_MS);
  return delay + Math.random() * 1_000;
}

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

/**
 * Registers listeners so a pending sync is attempted as soon as the device
 * comes back online, plus a background interval so backoff retries fire
 * even without another `online` transition. Call once from a client-side
 * layout/provider; safe to call multiple times (idempotent per module).
 */
let backgroundLoopStarted = false;

export function registerSyncListeners() {
  if (typeof window === "undefined") return;

  window.addEventListener("online", () => {
    void syncPendingSales();
  });

  if (backgroundLoopStarted) return;
  backgroundLoopStarted = true;

  setInterval(() => {
    if (navigator.onLine) void syncPendingSales();
  }, BACKGROUND_INTERVAL_MS);
}
