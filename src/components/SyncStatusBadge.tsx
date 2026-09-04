"use client";

import { useEffect } from "react";
import { registerSyncListeners } from "@/lib/sync";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { usePendingSyncCount } from "@/hooks/usePendingSyncCount";

/**
 * Small status pill showing connectivity + how many local sales are still
 * waiting to reach Supabase. Also the single place that arms the
 * background sync loop, so mounting it once (in the dashboard layout) is
 * enough for the whole app.
 */
export function SyncStatusBadge() {
  const isOnline = useOnlineStatus();
  const pendingCount = usePendingSyncCount();

  useEffect(() => {
    registerSyncListeners();
  }, []);

  const label = !isOnline
    ? `Offline · ${pendingCount} aksyon annatant`
    : pendingCount > 0
      ? `Ap senkwonize · ${pendingCount} aksyon`
      : "Anliy · Tout bagay senkwonize";

  const dotColor = !isOnline ? "bg-danger" : pendingCount > 0 ? "bg-warning" : "bg-success";

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs text-text-secondary">
      <span className={`h-2 w-2 rounded-full ${dotColor}`} aria-hidden />
      {label}
    </div>
  );
}
