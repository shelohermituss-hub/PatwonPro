import Link from "next/link";
import { Receipt } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyHTG, formatDateTime } from "@/lib/format";
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/pos/labels";
import type { DashboardSale } from "@/lib/dashboard/queries";
import type { PaymentStatus } from "@/types";

const STATUS_BADGE_CLASS: Record<PaymentStatus, string> = {
  paid: "border-transparent bg-success/10 text-success",
  partial: "border-transparent bg-warning/10 text-warning",
  credit: "border-transparent bg-warning/10 text-warning",
};

export function RecentSalesPanel({ sales }: { sales: DashboardSale[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dènye Vant Yo</CardTitle>
        <CardDescription>5 dènye vant ki fèt nan boutik ou</CardDescription>
      </CardHeader>
      <CardContent>
        {sales.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <Receipt className="size-8 text-text-secondary" aria-hidden />
            <p className="text-sm text-text-secondary">Poko gen vant jodi a.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {sales.map((sale) => (
              <li key={sale.id}>
                <Link
                  href={`/sales/${sale.id}`}
                  className="flex items-center justify-between gap-3 rounded-md py-1 hover:bg-muted"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">
                      {sale.customerName ?? "Kliyan jenerik"}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {formatDateTime(sale.created_at)} · {PAYMENT_METHOD_LABELS[sale.payment_method]}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrencyHTG(sale.total)}
                    </span>
                    <Badge variant="outline" className={STATUS_BADGE_CLASS[sale.payment_status]}>
                      {PAYMENT_STATUS_LABELS[sale.payment_status]}
                    </Badge>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/sales"
          className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
        >
          Wè tout vant yo →
        </Link>
      </CardContent>
    </Card>
  );
}
