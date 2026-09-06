import { syncPendingSales } from "./sales";
import { syncPendingProducts } from "./products";
import { syncPendingCreditPayments } from "./creditPayments";
import { syncPendingStockEntries } from "./stockEntries";
import { BACKGROUND_INTERVAL_MS } from "./backoff";
import { db } from "@/lib/db";

export { syncPendingSales } from "./sales";
export { syncPendingProducts, pullProducts } from "./products";
export { pullCustomers } from "./customers";
export { syncPendingCreditPayments, pullCreditPayments } from "./creditPayments";
export { syncPendingStockEntries, pullStockEntries } from "./stockEntries";

const STUCK_THRESHOLD_MS = 15 * 60_000;
const LAST_RESYNC_HANDLED_KEY = "patwonpro:lastResyncHandledAt";

function getLastResyncHandledAt(): string | null {
  try {
    return localStorage.getItem(LAST_RESYNC_HANDLED_KEY);
  } catch {
    return null;
  }
}

function setLastResyncHandledAt(iso: string) {
  try {
    localStorage.setItem(LAST_RESYNC_HANDLED_KEY, iso);
  } catch {
    // Private browsing / storage disabled — worst case we re-force a sync next heartbeat.
  }
}

/**
 * Reports this device's sync health to `/api/sync/heartbeat` so the admin
 * "Senkwonizasyon" page has a real signal (`devices.last_seen_at` was
 * never updated by anything before this). `errorCount` is a heuristic —
 * there's no per-row retry counter — a row still `pending` after 15
 * minutes has already exhausted several backoff attempts (capped at 5
 * min), so it's a reasonable proxy for "stuck". Returns
 * `resyncRequestedAt` (an admin's "Relanse Sync") so `syncAllPending()`
 * can react to it — best-effort `null` on any network failure.
 */
async function reportSyncHeartbeat(): Promise<{ resyncRequestedAt: string | null }> {
  const cutoff = new Date(Date.now() - STUCK_THRESHOLD_MS).toISOString();

  const [sales, products, creditPayments, stockEntries] = await Promise.all([
    db.sales.where("sync_status").equals("pending").toArray(),
    db.products.where("sync_status").equals("pending").toArray(),
    db.creditPayments.where("sync_status").equals("pending").toArray(),
    db.stockEntries.where("sync_status").equals("pending").toArray(),
  ]);

  const allPending = [...sales, ...products, ...creditPayments, ...stockEntries];
  const pendingCount = allPending.length;
  const errorCount = allPending.filter(
    (row) => "created_at" in row && typeof row.created_at === "string" && row.created_at < cutoff,
  ).length;

  try {
    const response = await fetch("/api/sync/heartbeat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pendingCount, errorCount }),
    });
    const data = (await response.json().catch(() => null)) as { resyncRequestedAt?: string | null } | null;
    return { resyncRequestedAt: data?.resyncRequestedAt ?? null };
  } catch {
    // Best-effort — no network is exactly the state this reports on.
    return { resyncRequestedAt: null };
  }
}

/**
 * `isForcedResync` guards against looping: an admin-requested resync
 * recurses into this function once (with the flag set) to run
 * immediately rather than waiting for the next interval tick; the
 * recursive call's own heartbeat sees `resyncRequestedAt` already
 * matches what was just recorded as handled, so it doesn't recurse again.
 */
async function syncAllPending(opts?: { isForcedResync?: boolean }) {
  await Promise.all([
    syncPendingSales(),
    syncPendingProducts(),
    syncPendingCreditPayments(),
    syncPendingStockEntries(),
  ]);
  const { resyncRequestedAt } = await reportSyncHeartbeat();

  if (!opts?.isForcedResync && resyncRequestedAt && resyncRequestedAt > (getLastResyncHandledAt() ?? "")) {
    setLastResyncHandledAt(resyncRequestedAt);
    await syncAllPending({ isForcedResync: true });
  }
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
    void syncAllPending();
  });

  if (backgroundLoopStarted) return;
  backgroundLoopStarted = true;

  setInterval(() => {
    if (navigator.onLine) void syncAllPending();
  }, BACKGROUND_INTERVAL_MS);
}
