"use client";

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
import { QRCodeImage } from "@/components/pos/QRCode";
import { formatCurrency } from "@/lib/format";
import { PAYMENT_METHOD_LABELS } from "@/lib/pos/labels";
import type { PaymentGatewayState } from "@/hooks/usePaymentGateway";

export function PaymentGatewayDialog({
  state,
  amount,
  onManualCheck,
  onCancel,
  onRetry,
  onClose,
}: {
  state: PaymentGatewayState;
  amount: number;
  onManualCheck: () => void;
  onCancel: () => void;
  onRetry: () => void;
  onClose: () => void;
}) {
  const open = state.status !== "idle";
  const methodLabel = "method" in state ? PAYMENT_METHOD_LABELS[state.method] : "Mobil";

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Peman {methodLabel}</DialogTitle>
          <DialogDescription>{formatCurrency(amount)}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2 text-center">
          {state.status === "creating" && (
            <>
              <LoaderCircle className="size-10 animate-spin text-primary" aria-hidden />
              <p className="text-sm text-text-secondary">N ap prepare peman an...</p>
            </>
          )}

          {state.status === "awaiting" && (
            <>
              <QRCodeImage value={state.redirectUrl} />
              <p className="text-sm text-text-secondary">
                Mande kliyan an eskane kòd sa a ak telefòn li pou l konplete
                peman an.
              </p>
              <a
                href={state.redirectUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                Oswa louvri lyen peman an
              </a>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <LoaderCircle className="size-4 animate-spin" aria-hidden />
                N ap tann konfimasyon...
              </div>
            </>
          )}

          {state.status === "confirmed" && (
            <>
              <Icons.success className="size-10 text-success" aria-hidden />
              <p className="text-sm font-medium text-foreground">Peman konfime!</p>
            </>
          )}

          {state.status === "cancelled" && (
            <>
              <Icons.cancelled className="size-10 text-warning" aria-hidden />
              <p className="text-sm text-text-secondary">Peman an anile.</p>
            </>
          )}

          {state.status === "failed" && (
            <>
              <Icons.failed className="size-10 text-danger" aria-hidden />
              <p className="text-sm text-text-secondary">{state.message}</p>
            </>
          )}

          {state.status === "error" && (
            <>
              <Icons.failed className="size-10 text-danger" aria-hidden />
              <p className="text-sm text-text-secondary">{state.message}</p>
            </>
          )}
        </div>

        <DialogFooter>
          {state.status === "awaiting" && (
            <>
              <Button variant="outline" onClick={onCancel} className="min-h-11">
                Anile
              </Button>
              <Button onClick={onManualCheck} className="min-h-11">
                Verifye kounye a
              </Button>
            </>
          )}

          {(state.status === "cancelled" ||
            state.status === "failed" ||
            state.status === "error") && (
            <>
              <Button variant="outline" onClick={onClose} className="min-h-11">
                Fèmen
              </Button>
              <Button onClick={onRetry} className="min-h-11">
                Eseye ankò
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
