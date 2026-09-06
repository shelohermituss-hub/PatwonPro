"use client";

import { useEffect, useRef } from "react";

export type PaymentPollStatus = "idle" | "polling";

export interface PaymentPollResult {
  status: "pending" | "paid" | "failed";
  error?: string;
}

interface UsePaymentPollingOptions {
  intervalMs?: number;
  timeoutMs?: number;
  onPaid?: () => void;
  onFailed?: (error: string | null) => void;
  onTimeout?: () => void;
}

/**
 * Polls a gateway-payment confirmation Server Action on an interval until
 * it settles (paid/failed) or `timeoutMs` elapses, invoking the matching
 * callback at that moment — the gateway (`src/lib/payments/gateway.ts`)
 * has no webhook, so this is the sole confirmation path. Settlement is
 * reported via callback rather than returned state, so a caller reacts
 * (toast, close dialog, refresh) right when the async tick resolves
 * instead of through a second effect watching a status value.
 */
export function usePaymentPolling(
  paymentId: string | null,
  confirm: (paymentId: string) => Promise<PaymentPollResult>,
  options: UsePaymentPollingOptions = {},
): { status: PaymentPollStatus } {
  const confirmRef = useRef(confirm);
  const optionsRef = useRef(options);

  useEffect(() => {
    confirmRef.current = confirm;
    optionsRef.current = options;
  });

  useEffect(() => {
    if (!paymentId) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const startedAt = Date.now();
    const intervalMs = optionsRef.current.intervalMs ?? 4000;
    const timeoutMs = optionsRef.current.timeoutMs ?? 120_000;

    async function tick() {
      try {
        const result = await confirmRef.current(paymentId as string);
        if (cancelled) return;
        if (result.status === "paid") {
          optionsRef.current.onPaid?.();
          return;
        }
        if (result.status === "failed") {
          optionsRef.current.onFailed?.(result.error ?? null);
          return;
        }
      } catch {
        // network hiccup — keep polling until timeout
      }

      if (cancelled) return;
      if (Date.now() - startedAt >= timeoutMs) {
        optionsRef.current.onTimeout?.();
        return;
      }
      timer = setTimeout(tick, intervalMs);
    }

    timer = setTimeout(tick, intervalMs);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [paymentId]);

  return { status: paymentId ? "polling" : "idle" };
}
