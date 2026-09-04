import { Wallet, TrendingUp, Receipt, ShoppingBasket } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { ReportSummary } from "@/lib/reports/queries";

export function KpiCards({ summary }: { summary: ReportSummary }) {
  const cards = [
    {
      label: "Total Vant",
      value: formatCurrency(summary.total_sales),
      hint: "Total tout vant sou peryòd la",
      icon: Wallet,
    },
    {
      label: "Pwofi Estime",
      value: formatCurrency(summary.estimated_profit),
      hint: "Pri vant mwens pri achte",
      icon: TrendingUp,
    },
    {
      label: "Tranzaksyon",
      value: String(summary.transaction_count),
      hint: "Kantite vant sou peryòd la",
      icon: Receipt,
    },
    {
      label: "Panye Mwayèn",
      value: formatCurrency(summary.avg_basket),
      hint: "Total vant / kantite vant",
      icon: ShoppingBasket,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map(({ label, value, hint, icon: Icon }) => (
        <Card key={label}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-sm font-medium text-text-secondary">
                {label}
              </CardTitle>
              <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-foreground">{value}</p>
            <CardDescription>{hint}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
