"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GatewayPaymentMethod } from "@/lib/payments/gateway";

export type PaymentGatewayState =
  | { status: "idle" }
  | { status: "creating"; method: GatewayPaymentMethod }
  | { status: "awaiting"; method: GatewayPaymentMethod; transactionId: string; redirectUrl: string }
  | { status: "confirmed"; method: GatewayPaymentMethod; transactionId: string }
  | { status: "cancelled" }
  | { status: "failed"; message: string }
  | { status: "error"; message: string };

const POLL_INTERVAL_MS = 4000;

/**
 * Drives the MonCash/NatCash create → poll → confirm flow through the
 * PLOP PLOP gateway (src/lib/payments/gateway.ts) — one client, since
 * both providers share the same API. Polling is the sole confirmation
 * path (the gateway has no webhook), so this hook polls on an interval
 * rather than just exposing a one-shot manual check.
 */
export function usePaymentGateway() {
  const [state, setState] = useState<PaymentGatewayState>({ status: "idle" });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const checkStatus = useCallback(
    async (method: GatewayPaymentMethod, transactionId: string) => {
      try {
        const res = await fetch(`/api/payments/status/${transactionId}`);
        if (!res.ok) return;
        const data = (await res.json()) as { status: string };

        if (data.status === "paid") {
          stopPolling();
          setState({ status: "confirmed", method, transactionId });
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
    async (method: GatewayPaymentMethod, amount: number) => {
      setState({ status: "creating", method });
      try {
        const res = await fetch("/api/payments/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, method }),
        });
        const data = await res.json();

        if (!res.ok) {
          setState({ status: "error", message: data.error ?? "Erè enkoni." });
          return;
        }

        setState({
          status: "awaiting",
          method,
          transactionId: data.transactionId,
          redirectUrl: data.redirectUrl,
        });
        pollRef.current = setInterval(
          () => void checkStatus(method, data.transactionId),
          POLL_INTERVAL_MS,
        );
      } catch {
        setState({ status: "error", message: "Nou pa t ka konekte ak sèvè peman an." });
      }
    },
    [checkStatus],
  );

  const manualCheck = useCallback(() => {
    if (state.status === "awaiting") void checkStatus(state.method, state.transactionId);
  }, [state, checkStatus]);

  const cancel = useCallback(async () => {
    stopPolling();
    if (state.status === "awaiting") {
      const { transactionId } = state;
      setState({ status: "cancelled" });
      try {
        await fetch(`/api/payments/status/${transactionId}`, {
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
      await fetch(`/api/payments/status/${transactionId}`, {
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
