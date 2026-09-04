"use client";

import { useEffect } from "react";
import { registerSyncListeners } from "@/lib/sync";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { usePendingSyncSummary } from "@/hooks/usePendingSyncSummary";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

const QUEUE_LABELS = [
  { key: "sales", label: "Vant" },
  { key: "products", label: "Pwodwi" },
  { key: "creditPayments", label: "Peman kredi" },
  { key: "stockEntries", label: "Antre stòk" },
] as const;

/**
 * Small status pill showing connectivity + how many local rows (sales,
 * products, credit repayments) are still waiting to reach Supabase, with a
 * popover breaking that count down by table. Also the single place that
 * arms the background sync loop, so mounting it once (in the dashboard
 * shell) is enough for the whole app.
 */
export function SyncStatusBadge() {
  const isOnline = useOnlineStatus();
  const summary = usePendingSyncSummary();

  useEffect(() => {
    registerSyncListeners();
  }, []);

  const label = !isOnline
    ? `Offline · ${summary.total} aksyon annatant`
    : summary.total > 0
      ? `Ap senkwonize · ${summary.total} aksyon`
      : "Anliy · Tout bagay senkwonize";

  const dotColor = !isOnline ? "bg-danger" : summary.total > 0 ? "bg-warning" : "bg-success";

  const pill = (
    <span className="flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs text-text-secondary">
      <span className={`h-2 w-2 rounded-full ${dotColor}`} aria-hidden />
      {label}
    </span>
  );

  if (summary.total === 0) {
    return pill;
  }

  return (
    <Popover>
      <PopoverTrigger className="rounded-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {pill}
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <PopoverTitle>Aksyon k ap tann senkwonizasyon</PopoverTitle>
        <ul className="flex flex-col gap-1">
          {QUEUE_LABELS.map(({ key, label: queueLabel }) => (
            <li
              key={key}
              className="flex items-center justify-between text-sm text-text-secondary"
            >
              <span>{queueLabel}</span>
              <span className="font-medium text-foreground">{summary[key]}</span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
