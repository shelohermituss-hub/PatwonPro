"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type MonCashPaymentState =
  | { status: "idle" }
  | { status: "creating" }
  | { status: "awaiting"; transactionId: string; redirectUrl: string }
  | { status: "confirmed"; transactionId: string }
  | { status: "cancelled" }
  | { status: "failed"; message: string }
  | { status: "error"; message: string };

const POLL_INTERVAL_MS = 4000;

/**
 * Drives the MonCash create → poll → confirm flow. Polling is the
 * primary confirmation path (see src/lib/payments/moncash.ts — MonCash's
 * own docs don't offer a webhook), so this hook polls on an interval
 * rather than just exposing a one-shot manual check.
 */
export function useMonCashPayment() {
  const [state, setState] = useState<MonCashPaymentState>({ status: "idle" });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const checkStatus = useCallback(
    async (transactionId: string) => {
      try {
        const res = await fetch(`/api/moncash/status/${transactionId}`);
        if (!res.ok) return;
        const data = (await res.json()) as { status: string };

        if (data.status === "paid") {
          stopPolling();
          setState({ status: "confirmed", transactionId });
        } else if (data.status === "cancelled") {
          stopPolling();
          setState({ status: "cancelled" });
        } else if (data.status === "failed") {
          stopPolling();
          setState({ status: "failed", message: "Peman an echwe." });
        }
        // "pending" — keep waiting, no state change.
      } catch {
        // Network hiccup — the interval will retry.
      }
    },
    [stopPolling],
  );

  const start = useCallback(
    async (amount: number) => {
      setState({ status: "creating" });
      try {
        const res = await fetch("/api/moncash/create-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
        });
        const data = await res.json();

        if (!res.ok) {
          setState({ status: "error", message: data.error ?? "Erè enkoni." });
          return;
        }

        setState({
          status: "awaiting",
          transactionId: data.transactionId,
          redirectUrl: data.redirectUrl,
        });
        pollRef.current = setInterval(() => void checkStatus(data.transactionId), POLL_INTERVAL_MS);
      } catch {
        setState({ status: "error", message: "Nou pa t ka konekte ak MonCash." });
      }
    },
    [checkStatus],
  );

  const manualCheck = useCallback(() => {
    if (state.status === "awaiting") void checkStatus(state.transactionId);
  }, [state, checkStatus]);

  const cancel = useCallback(async () => {
    stopPolling();
    if (state.status === "awaiting") {
      const { transactionId } = state;
      setState({ status: "cancelled" });
      try {
        await fetch(`/api/moncash/status/${transactionId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "cancel" }),
        });
      } catch {
        // Best-effort — the UI has already moved on.
      }
    } else {
      setState({ status: "idle" });
    }
  }, [state, stopPolling]);

  const linkSale = useCallback(async (transactionId: string, saleId: string) => {
    try {
      await fetch(`/api/moncash/status/${transactionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "link-sale", saleId }),
      });
    } catch {
      // Best-effort — the sale itself already succeeded; this is only audit linkage.
    }
  }, []);

  const reset = useCallback(() => {
    stopPolling();
    setState({ status: "idle" });
  }, [stopPolling]);

  return { state, start, manualCheck, cancel, linkSale, reset };
}
