"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface StorePaymentConfig {
  moncashPhone: string | null;
  moncashQrUrl: string | null;
  natcashPhone: string | null;
  natcashQrUrl: string | null;
}

/**
 * The store's own MonCash/NatCash phone + QR code, configured on
 * `/settings` (`MobilePaymentConfigForm`) — shown to the cashier in
 * `MobilePaymentConfirmDialog` so the customer can pay directly into the
 * store's own mobile money account. Small, rarely-changing config, so a
 * plain client-side fetch (not mirrored in Dexie) is enough; POS still
 * works fully offline for cash, which is the offline-first priority.
 */
export function useStorePaymentConfig(storeId: string | null | undefined) {
  const [config, setConfig] = useState<StorePaymentConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      if (!storeId) {
        if (!cancelled) {
          setConfig(null);
          setIsLoading(false);
        }
        return;
      }

      const { data } = await supabase
        .from("stores")
        .select("moncash_phone, moncash_qr_url, natcash_phone, natcash_qr_url")
        .eq("id", storeId)
        .maybeSingle();

      if (!cancelled) {
        setConfig(
          data
            ? {
                moncashPhone: data.moncash_phone,
                moncashQrUrl: data.moncash_qr_url,
                natcashPhone: data.natcash_phone,
                natcashQrUrl: data.natcash_qr_url,
              }
            : null,
        );
        setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [storeId]);

  return { config, isLoading };
}
