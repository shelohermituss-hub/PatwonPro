import {
  SUBSCRIPTION_PLAN_LABELS,
  SUBSCRIPTION_STATUS_LABELS,
} from "@/lib/subscription/labels";
import { formatCurrencyHTG, formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import type { Subscription } from "@/types";

const STATUS_VARIANT: Record<Subscription["status"], "default" | "secondary" | "destructive"> = {
  trialing: "secondary",
  active: "default",
  past_due: "destructive",
  canceled: "destructive",
  expired: "destructive",
};

export function SubscriptionSummaryCard({
  subscription,
}: {
  subscription: Subscription | null;
}) {
  if (!subscription) {
    return (
      <div className="flex max-w-lg flex-col gap-2 rounded-lg border border-dashed border-border p-4 text-sm text-text-secondary">
        Boutik ou poko gen yon abònman konfigire. Kontakte sipò PatwonPro.
      </div>
    );
  }

  return (
    <div className="flex max-w-lg flex-col gap-3 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-foreground">
          Plan {SUBSCRIPTION_PLAN_LABELS[subscription.plan]}
        </h2>
        <Badge variant={STATUS_VARIANT[subscription.status]}>
          {SUBSCRIPTION_STATUS_LABELS[subscription.status]}
        </Badge>
      </div>
      <dl className="grid grid-cols-2 gap-y-1 text-sm text-text-secondary">
        {subscription.price_htg !== null && (
          <>
            <dt>Pri</dt>
            <dd className="text-foreground">{formatCurrencyHTG(subscription.price_htg)}</dd>
          </>
        )}
        {subscription.current_period_end && (
          <>
            <dt>Peryòd la fini</dt>
            <dd className="text-foreground">
              {formatDateTime(subscription.current_period_end)}
            </dd>
          </>
        )}
      </dl>
    </div>
  );
}
