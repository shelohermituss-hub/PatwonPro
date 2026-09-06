import { PaymentDialog } from "@/components/subscription/PaymentDialog";
import {
  DEPOSIT_STATUS_LABELS,
  DEPOSIT_PAYMENT_MODE_LABELS,
} from "@/lib/subscription/labels";
import { formatCurrencyHTG } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import type { Deposit, Device } from "@/types";

const STATUS_VARIANT: Record<Deposit["status"], "default" | "secondary" | "destructive"> = {
  pending: "secondary",
  received: "default",
  held: "default",
  eligible_for_refund: "secondary",
  refund_requested: "secondary",
  refunded: "secondary",
  partially_retained: "destructive",
  fully_retained: "destructive",
};

/**
 * One card per non-terminal deposit — shown only for devices that
 * currently have a payable security deposit (see
 * `fetchSubscriptionData`, which already excludes `refunded`/
 * `fully_retained` rows). The pay button is hidden once the target
 * amount is fully paid, even if an admin hasn't advanced the status yet.
 */
export function TabletDepositCard({ deposit, device }: { deposit: Deposit; device: Device | undefined }) {
  const remaining = Math.max(0, deposit.amount_htg - deposit.amount_paid_htg);
  const nextAmountHtg =
    deposit.payment_mode === "monthly_installment" && deposit.monthly_installment_htg
      ? Math.min(deposit.monthly_installment_htg, remaining)
      : remaining;

  return (
    <div className="flex max-w-lg flex-col gap-3 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">
          Kosyon — {device?.name ?? "Tablèt"}
        </h3>
        <Badge variant={STATUS_VARIANT[deposit.status]}>
          {DEPOSIT_STATUS_LABELS[deposit.status]}
        </Badge>
      </div>

      <dl className="grid grid-cols-2 gap-y-1 text-sm text-text-secondary">
        <dt>Montan total</dt>
        <dd className="text-foreground">{formatCurrencyHTG(deposit.amount_htg)}</dd>
        <dt>Deja peye</dt>
        <dd className="text-foreground">{formatCurrencyHTG(deposit.amount_paid_htg)}</dd>
        <dt>Rete</dt>
        <dd className="text-foreground">{formatCurrencyHTG(remaining)}</dd>
        <dt>Mòd peman</dt>
        <dd className="text-foreground">{DEPOSIT_PAYMENT_MODE_LABELS[deposit.payment_mode]}</dd>
      </dl>

      {remaining > 0 && (
        <PaymentDialog
          kind="deposit"
          depositId={deposit.id}
          amountHtg={nextAmountHtg}
          triggerLabel={
            deposit.payment_mode === "monthly_installment"
              ? "Peye Mansyalite Kosyon"
              : "Peye Kosyon"
          }
        />
      )}
    </div>
  );
}
