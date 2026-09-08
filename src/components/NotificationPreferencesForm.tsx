"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { haptics } from "@/lib/haptics";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { subscribeToPush, getPushPermissionState } from "@/lib/push/subscribe";
import { NOTIFICATION_CATEGORY_LABELS } from "@/lib/notifications/labels";
import { formatDateTime } from "@/lib/format";
import type { NotificationPreferencesData, NotificationLogEntry } from "@/lib/notifications/queries";

const TOGGLES: { key: keyof NotificationPreferencesData; column: string; label: string; description: string }[] = [
  { key: "subscriptionReminders", column: "subscription_reminders", label: "Rapèl abònman", description: "Lè peman abònman ou pre rive oswa an reta." },
  { key: "lowStock", column: "low_stock", label: "Stòk ba", description: "Lè yon pwodwi rive nan sèy stòk ba li." },
  { key: "creditOverdue", column: "credit_overdue", label: "Kredi an reta", description: "Lè yon kredi kliyan pase 30 jou san peman." },
  { key: "syncErrors", column: "sync_errors", label: "Erè senkwonizasyon", description: "Lè aparèy ou gen aksyon ki pa ka senkwonize pou yon bon tan." },
  { key: "newSales", column: "new_sales", label: "Nouvo vant ak ranbousman", description: "Notifikasyon pou chak vant/ranbousman — dezaktive pa defo pou pa fè twòp." },
];

export function NotificationPreferencesForm({
  profileId,
  initialPreferences,
  initialLogs,
}: {
  profileId: string;
  initialPreferences: NotificationPreferencesData;
  initialLogs: NotificationLogEntry[];
}) {
  const [preferences, setPreferences] = useState(initialPreferences);
  // Reflects *this device's* permission — a profile can have push
  // enabled on their phone but not on this desktop, so this can't be
  // known server-side; checked once on mount instead.
  const [pushEnabled, setPushEnabled] = useState(false);
  const [enabling, setEnabling] = useState(false);

  useEffect(() => {
    void getPushPermissionState().then((state) => {
      if (state === "granted") setPushEnabled(true);
    });
  }, []);

  async function handleToggle(key: keyof NotificationPreferencesData, column: string, value: boolean) {
    haptics.tap();
    setPreferences((prev) => ({ ...prev, [key]: value }));
    const supabase = createClient();
    const { error } = await supabase
      .from("notification_preferences")
      .upsert({ profile_id: profileId, [column]: value }, { onConflict: "profile_id" });

    if (error) {
      haptics.error();
      setPreferences((prev) => ({ ...prev, [key]: !value }));
      toast.error("Nou pa t ka anrejistre chwa ou a.");
    }
  }

  async function handleEnablePush() {
    setEnabling(true);
    const { error } = await subscribeToPush();
    setEnabling(false);
    if (error) {
      haptics.error();
      toast.error(error);
    } else {
      haptics.success();
      setPushEnabled(true);
      toast.success("Notifikasyon push aktive sou aparèy sa a.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold text-foreground">Notifikasyon push</h3>
            <p className="text-sm text-text-secondary">
              Resevwa alèt sou aparèy sa a menm lè aplikasyon an fèmen.
            </p>
          </div>
          {pushEnabled ? (
            <Badge variant="secondary">Aktive sou aparèy sa a</Badge>
          ) : (
            <Button type="button" onClick={handleEnablePush} disabled={enabling}>
              Aktive
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {TOGGLES.map(({ key, column, label, description }) => (
          <div key={key} className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">{label}</span>
              <span className="text-sm text-text-secondary">{description}</span>
            </div>
            <Switch
              checked={preferences[key]}
              onCheckedChange={(value) => void handleToggle(key, column, value)}
              aria-label={label}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground">Istorik (20 dènye)</h3>
        {initialLogs.length === 0 ? (
          <EmptyState compact illustration="generic" title="Pa gen istorik" description="Notifikasyon voye yo ap parèt isit la." />
        ) : (
          <ul className="flex flex-col gap-2">
            {initialLogs.map((log) => (
              <li key={log.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3 text-sm">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-foreground">{log.title}</span>
                  <span className="text-text-secondary">{log.body}</span>
                  <span className="text-xs text-text-secondary">
                    {NOTIFICATION_CATEGORY_LABELS[log.category]} · {formatDateTime(log.createdAt)}
                  </span>
                </div>
                <Badge variant={log.status === "sent" ? "secondary" : "destructive"}>
                  {log.status === "sent" ? "Voye" : "Echwe"}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
