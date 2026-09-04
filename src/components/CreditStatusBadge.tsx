import { Badge } from "@/components/ui/badge";
import { CREDIT_STATUS_LABELS } from "@/lib/credits/labels";
import type { CreditStatus } from "@/lib/credits/status";

const STATUS_CLASS: Record<CreditStatus, string> = {
  paid: "border-transparent bg-success/10 text-success",
  active: "border-transparent bg-warning/10 text-warning",
  overdue: "border-transparent bg-danger/10 text-danger",
};

/** Credit status pill. Never color-only (docs/UI_RULES.md §3) — always carries text. */
export function CreditStatusBadge({ status }: { status: CreditStatus }) {
  return (
    <Badge variant="outline" className={STATUS_CLASS[status]}>
      {CREDIT_STATUS_LABELS[status]}
    </Badge>
  );
}
