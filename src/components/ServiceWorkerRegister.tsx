"use client";

import { useEffect } from "react";

/**
 * Registers public/sw.js. Production-only: in dev, Turbopack rebuilds
 * bundles under fresh hashes constantly, and a service worker caching
 * those would fight HMR instead of helping offline use.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Offline-first is a progressive enhancement here — Dexie already
      // works without it, so a failed registration isn't fatal.
    });
  }, []);

  return null;
}
