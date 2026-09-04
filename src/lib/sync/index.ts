import { syncPendingSales } from "./sales";
import { syncPendingProducts } from "./products";
import { syncPendingCreditPayments } from "./creditPayments";
import { BACKGROUND_INTERVAL_MS } from "./backoff";

export { syncPendingSales } from "./sales";
export { syncPendingProducts, pullProducts } from "./products";
export { pullCustomers } from "./customers";
export { syncPendingCreditPayments, pullCreditPayments } from "./creditPayments";

async function syncAllPending() {
  await Promise.all([
    syncPendingSales(),
    syncPendingProducts(),
    syncPendingCreditPayments(),
  ]);
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
