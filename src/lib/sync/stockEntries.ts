import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/client";
import { nextRetryDelay } from "./backoff";

/**
 * Pushes every locally created stock entry that hasn't reached Supabase
 * yet. Unlike products, a stock entry is never edited after creation (the
 * table is append-only, see 00000000000008) so a plain `insert` is enough
 * — no upsert-on-conflict semantics needed.
 */
export async function syncPendingStockEntries() {
  const now = Date.now();
  const pending = (
    await db.stockEntries.where("sync_status").equals("pending").toArray()
  ).filter((e) => !e.next_sync_at || new Date(e.next_sync_at).getTime() <= now);

  if (pending.length === 0) return { synced: 0, failed: 0 };

  const supabase = createClient();
  let synced = 0;
  let failed = 0;

  for (const entry of pending) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- dropping Dexie-only fields
    const { sync_status, sync_attempts, next_sync_at, ...entryRecord } = entry;

    const { error } = await supabase.from("stock_entries").insert(entryRecord);

    if (error) {
      failed += 1;
      const attempts = (entry.sync_attempts ?? 0) + 1;
      await db.stockEntries.update(entry.id, {
        sync_attempts: attempts,
        next_sync_at: new Date(now + nextRetryDelay(attempts)).toISOString(),
      });
      continue;
    }

    await db.stockEntries.update(entry.id, {
      sync_status: "synced",
      sync_attempts: 0,
      next_sync_at: null,
    });
    synced += 1;
  }

  return { synced, failed };
}

/**
 * Hydrates Dexie from Supabase for the current store — the read path the
 * /stock-entries history page relies on to work offline. Rows with unsynced
 * local edits (`sync_status: "pending"`) are left alone so a pull never
 * clobbers an entry still waiting to push.
 */
export async function pullStockEntries(storeId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("stock_entries")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (error) return { pulled: 0, error };

  const pendingIds = new Set(
    (await db.stockEntries.where("sync_status").equals("pending").primaryKeys()) as string[],
  );

  const incoming = (data ?? [])
    .filter((e) => !pendingIds.has(e.id))
    .map((e) => ({ ...e, sync_status: "synced" as const, sync_attempts: 0, next_sync_at: null }));

  await db.stockEntries.bulkPut(incoming);

  return { pulled: incoming.length, error: null };
}
