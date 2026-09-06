"use client";

import Image from "next/image";
import { LoaderCircle } from "lucide-react";
import { Icons } from "@/lib/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { PAYMENT_METHOD_LABELS } from "@/lib/pos/labels";
import type { GatewayPaymentMethod } from "@/lib/payments/gateway";

const LOGO: Record<GatewayPaymentMethod, { src: string; width: number; height: number }> = {
  moncash: { src: "/images/payment-methods/moncash-logo.png", width: 90, height: 80 },
  natcash: { src: "/images/payment-methods/natcash-logo.png", width: 160, height: 32 },
};

/**
 * Replaces the old gateway-driven flow: no API call, no polling. The
 * store configures its own MonCash/NatCash number + QR code on
 * `/settings` (`MobilePaymentConfigForm`) — this dialog shows that to
 * the cashier so the customer can send the money directly, and the
 * cashier confirms manually after checking receipt on their own phone.
 * Confirming completes the sale immediately, exactly like cash.
 */
export function MobilePaymentConfirmDialog({
  method,
  amount,
  phone,
  qrUrl,
  isSubmitting,
  onConfirm,
  onCancel,
}: {
  method: GatewayPaymentMethod | null;
  amount: number;
  phone: string | null;
  qrUrl: string | null;
  isSubmitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const open = method !== null;
  if (!method) return null;

  const methodLabel = PAYMENT_METHOD_LABELS[method];
  const logo = LOGO[method];
  const notConfigured = !phone;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Peman {methodLabel}</DialogTitle>
          <DialogDescription>{formatCurrency(amount)}</DialogDescription>
        </DialogHeader>

        {notConfigured ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <Icons.failed className="size-10" aria-hidden />
            <p className="text-sm font-medium text-foreground">
              Ou poko konfigire {methodLabel} pou boutik ou.
            </p>
            <p className="text-sm text-text-secondary">
              Ale nan Paramèt &gt; Peman Mobil pou antre nimewo {methodLabel} ou.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <Image src={logo.src} alt={methodLabel} width={logo.width} height={logo.height} className="h-10 w-auto object-contain" />

            {qrUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- remote Supabase Storage public URL, not a static build asset
              <img src={qrUrl} alt={`Kòd QR ${methodLabel}`} className="size-40 rounded-lg border border-border object-contain" />
            )}

            <div className="flex flex-col gap-1">
              <span className="text-xs text-text-secondary">Voye lajan an sou nimewo</span>
              <span className="text-2xl font-bold tracking-wide text-foreground">{phone}</span>
            </div>

            <p className="max-w-xs text-sm text-text-secondary">
              Mande kliyan an voye {formatCurrency(amount)} sou nimewo sa a pa {methodLabel},
              oswa fè l eskane kòd QR a. Tcheke sou pwòp telefòn ou pou konfime lajan an antre
              anvan w klike &laquo;&nbsp;Konfime&nbsp;&raquo;.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} className="min-h-11" disabled={isSubmitting}>
            Anile
          </Button>
          {!notConfigured && (
            <Button onClick={onConfirm} className="min-h-11" disabled={isSubmitting}>
              {isSubmitting && <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden />}
              Konfime — Lajan an Antre
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
