import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/client";
import { nextRetryDelay } from "./backoff";

/**
 * Pushes every locally created/edited product that hasn't reached
 * Supabase yet. Unlike sales, a product row can be edited more than
 * once before it syncs — `upsert` on the primary key still makes this
 * idempotent whether it's a first create or a later edit (see
 * dexie-offline.skill for why this reuses the sales pattern instead of
 * a generic op-queue: products are still just "pending vs synced" per
 * row, never a sequence of operations to replay).
 */
export async function syncPendingProducts() {
  const now = Date.now();
  const pending = (
    await db.products.where("sync_status").equals("pending").toArray()
  ).filter((p) => !p.next_sync_at || new Date(p.next_sync_at).getTime() <= now);

  if (pending.length === 0) return { synced: 0, failed: 0 };

  const supabase = createClient();
  let synced = 0;
  let failed = 0;

  for (const product of pending) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- dropping Dexie-only fields
    const { sync_status, sync_attempts, next_sync_at, ...productRecord } = product;

    const { error } = await supabase.from("products").upsert(productRecord);

    if (error) {
      failed += 1;
      const attempts = (product.sync_attempts ?? 0) + 1;
      await db.products.update(product.id, {
        sync_attempts: attempts,
        next_sync_at: new Date(now + nextRetryDelay(attempts)).toISOString(),
      });
      continue;
    }

    await db.products.update(product.id, {
      sync_status: "synced",
      sync_attempts: 0,
      next_sync_at: null,
    });
    synced += 1;
  }

  return { synced, failed };
}

/**
 * Hydrates Dexie from Supabase (products + categories) for the current
 * store — the read path POS/product screens rely on to work offline.
 * Rows with unsynced local edits (`sync_status: "pending"`) are left
 * alone so a pull never clobbers a change still waiting to push.
 */
export async function pullProducts(storeId: string) {
  const supabase = createClient();

  const [{ data: products, error: productsError }, { data: categories, error: categoriesError }] =
    await Promise.all([
      supabase.from("products").select("*").eq("store_id", storeId),
      supabase.from("categories").select("*").eq("store_id", storeId),
    ]);

  if (productsError || categoriesError) {
    return { pulled: 0, error: productsError ?? categoriesError };
  }

  const pendingIds = new Set(
    (await db.products.where("sync_status").equals("pending").primaryKeys()) as string[],
  );

  const incoming = (products ?? [])
    .filter((p) => !pendingIds.has(p.id))
    .map((p) => ({ ...p, sync_status: "synced" as const, sync_attempts: 0, next_sync_at: null }));

  await db.products.bulkPut(incoming);
  if (categories?.length) await db.categories.bulkPut(categories);

  return { pulled: incoming.length, error: null };
}
