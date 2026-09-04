import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/client";
import { nextRetryDelay } from "./backoff";

/**
 * Pushes every locally-recorded repayment that hasn't reached Supabase
 * yet. Payment ids are client-generated UUIDs, so a retried push is
 * idempotent (upsert on primary key) — see the `after insert`-only
 * trigger note in 00000000000003_credit_balance_triggers.sql, which
 * relies on that same idempotency to avoid double-counting a balance.
 */
export async function syncPendingCreditPayments() {
  const now = Date.now();
  const pending = (
    await db.creditPayments.where("sync_status").equals("pending").toArray()
  ).filter(
    (payment) => !payment.next_sync_at || new Date(payment.next_sync_at).getTime() <= now,
  );

  if (pending.length === 0) return { synced: 0, failed: 0 };

  const supabase = createClient();
  let synced = 0;
  let failed = 0;

  for (const payment of pending) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- dropping Dexie-only fields
    const { sync_status, sync_attempts, next_sync_at, ...record } = payment;
    const { error } = await supabase.from("credit_payments").upsert(record);

    if (error) {
      failed += 1;
      const attempts = (payment.sync_attempts ?? 0) + 1;
      await db.creditPayments.update(payment.id, {
        sync_attempts: attempts,
        next_sync_at: new Date(now + nextRetryDelay(attempts)).toISOString(),
      });
      continue;
    }

    await db.creditPayments.update(payment.id, {
      sync_status: "synced",
      sync_attempts: 0,
      next_sync_at: null,
    });
    synced += 1;
  }

  return { synced, failed };
}

export async function pullCreditPayments(storeId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("credit_payments")
    .select("*")
    .eq("store_id", storeId);

  if (error) return { pulled: 0, error };

  const pendingIds = new Set(
    (await db.creditPayments.where("sync_status").equals("pending").primaryKeys()) as string[],
  );
  const incoming = (data ?? [])
    .filter((p) => !pendingIds.has(p.id))
    .map((p) => ({ ...p, sync_status: "synced" as const, sync_attempts: 0, next_sync_at: null }));
  await db.creditPayments.bulkPut(incoming);

  return { pulled: incoming.length, error: null };
}
