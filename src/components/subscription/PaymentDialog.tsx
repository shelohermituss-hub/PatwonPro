"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { Icons } from "@/lib/icons";
import { formatCurrencyHTG } from "@/lib/format";
import {
  startSubscriptionPayment,
  confirmSubscriptionPayment,
} from "@/lib/subscription/actions/payments";
import type { GatewayPaymentMethod } from "@/lib/payments/gateway";
import { usePaymentPolling } from "@/hooks/usePaymentPolling";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";

interface PaymentDialogProps {
  kind: "subscription" | "deposit";
  depositId?: string;
  amountHtg: number;
  triggerLabel: string;
}

export function PaymentDialog({ kind, depositId, amountHtg, triggerLabel }: PaymentDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<GatewayPaymentMethod>("moncash");
  const [isStarting, setIsStarting] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  const { status } = usePaymentPolling(paymentId, confirmSubscriptionPayment, {
    onPaid: () => {
      toast.success("Peman resevwa.");
      setOpen(false);
      setPaymentId(null);
      router.refresh();
    },
    onFailed: (error) => {
      toast.error(error ?? "Peman an echwe.");
      setPaymentId(null);
    },
    onTimeout: () => {
      toast.info("Nou poko konfime peman an. Tcheke pita — li ka toujou an trete.");
      setPaymentId(null);
    },
  });
  const isPolling = status === "polling";

  async function handlePay() {
    setStartError(null);
    setIsStarting(true);
    const result = await startSubscriptionPayment({ kind, method, depositId });
    setIsStarting(false);

    if ("error" in result) {
      setStartError(result.error);
      return;
    }
    if (result.redirectUrl) {
      window.open(result.redirectUrl, "_blank", "noopener,noreferrer");
    }
    setPaymentId(result.paymentId);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isPolling) setOpen(next);
      }}
    >
      <DialogTrigger render={<Button className="min-h-12" />}>
        <Icons.credit data-icon="inline-start" aria-hidden />
        {triggerLabel}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {kind === "subscription" ? "Peye Abònman" : "Peye Kosyon Tablèt"}
          </DialogTitle>
          <DialogDescription>
            Montan pou peye: {formatCurrencyHTG(amountHtg)}
          </DialogDescription>
        </DialogHeader>

        <FieldGroup className="px-4">
          {!paymentId && (
            <Field>
              <FieldLabel htmlFor="payment-method">Mwayen peman</FieldLabel>
              <Select
                value={method}
                onValueChange={(v) => setMethod((v as GatewayPaymentMethod) ?? "moncash")}
              >
                <SelectTrigger id="payment-method" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="moncash">MonCash</SelectItem>
                    <SelectItem value="natcash">NatCash</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          )}

          {isPolling && (
            <p className="flex items-center gap-2 text-sm text-text-secondary">
              <LoaderCircle className="animate-spin" aria-hidden />
              N ap tann konfimasyon gateway a...
            </p>
          )}

          {startError && (
            <p role="alert" className="text-sm font-medium text-danger">
              {startError}
            </p>
          )}
        </FieldGroup>

        <DialogFooter>
          <Button onClick={handlePay} disabled={isStarting || isPolling} className="min-h-12">
            {(isStarting || isPolling) && (
              <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden />
            )}
            Peye {formatCurrencyHTG(amountHtg)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
