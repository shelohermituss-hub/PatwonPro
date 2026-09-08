"use client";

import { TriangleAlert } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

/**
 * `/dashboard` reads Supabase directly (Server Component, not Dexie —
 * unlike products/sales/credits) — offline, the service worker serves
 * the last cached HTML shell with whatever numbers were current at
 * that visit, silently. This makes the staleness visible instead.
 */
export function DashboardOfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-foreground">
      <TriangleAlert className="size-4 shrink-0 text-warning" aria-hidden />
      Done sa yo ka pa ajou — ou offline. Y ap rafrechi otomatikman lè
      koneksyon an retounen.
    </div>
  );
}
