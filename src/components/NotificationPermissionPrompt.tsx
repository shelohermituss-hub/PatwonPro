"use client";

import { useEffect, useState } from "react";
import { X, BellRing } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { isPushSupported, isPushConfigured, getPushPermissionState, subscribeToPush } from "@/lib/push/subscribe";

const DISMISSED_KEY = "patwonpro:notification-prompt-dismissed";

/**
 * Explains what push notifications are for *before* the browser's own
 * permission prompt — same pattern as `InstallPrompt.tsx` (never a
 * cold OS prompt on first load, which mostly trains users to reject
 * it). Only shows when permission is still "default" (never asked,
 * never denied) and the user hasn't dismissed this banner before.
 */
export function NotificationPermissionPrompt() {
  const [visible, setVisible] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return;
    void getPushPermissionState().then((state) => {
      if (state === "default") setVisible(true);
    });
  }, []);

  // Not configured (missing NEXT_PUBLIC_VAPID_PUBLIC_KEY on this
  // deployment) means clicking "Aktive" can never succeed — hide the
  // banner instead of inviting a click a merchant can't fix themselves.
  if (!visible || !isPushSupported() || !isPushConfigured()) return null;

  async function handleEnable() {
    setRequesting(true);
    const { error } = await subscribeToPush();
    setRequesting(false);
    setVisible(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Notifikasyon aktive.");
    }
  }

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border bg-primary/5 px-4 py-2.5">
      <div className="flex items-center gap-2 text-sm text-foreground">
        <BellRing className="size-4 shrink-0" aria-hidden />
        Aktive notifikasyon pou resevwa alèt stòk ba, kredi an reta, ak rapèl
        abònman — menm lè aplikasyon an fèmen.
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button type="button" onClick={handleEnable} disabled={requesting}>
          Aktive
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={dismiss}
          aria-label="Fèmen"
          className="size-9 text-text-secondary"
        >
          <X className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
