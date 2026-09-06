"use client";

import { Icons } from "@/lib/icons";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { formatCurrency } from "@/lib/format";
import type { ReportSummary } from "@/lib/reports/queries";

/**
 * `format` is a string key, not a function — `KpiCards` is rendered from
 * `(dashboard)/reports/page.tsx`, a Server Component, and a function prop
 * can't cross the Server→Client boundary (only serializable values can).
 * The actual formatter is resolved here, entirely client-side.
 */
const FORMATTERS: Record<"currency" | "count", (n: number) => string> = {
  currency: formatCurrency,
  count: (n) => String(n),
};

export function KpiCards({ summary }: { summary: ReportSummary }) {
  const cards = [
    {
      label: "Total Vant",
      value: summary.total_sales,
      format: "currency" as const,
      hint: "Total tout vant sou peryòd la",
      icon: Icons.sales,
    },
    {
      label: "Pwofi Estime",
      value: summary.estimated_profit,
      format: "currency" as const,
      hint: "Pri vant mwens pri achte",
      icon: Icons.trendUp,
    },
    {
      label: "Tranzaksyon",
      value: summary.transaction_count,
      format: "count" as const,
      hint: "Kantite vant sou peryòd la",
      icon: Icons.transactionCount,
    },
    {
      label: "Panye Mwayèn",
      value: summary.avg_basket,
      format: "currency" as const,
      hint: "Total vant / kantite vant",
      icon: Icons.avgBasket,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map(({ label, value, format, hint, icon: Icon }) => (
        <Card key={label}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-sm font-medium text-text-secondary">
                {label}
              </CardTitle>
              <div className="flex size-9 items-center justify-center rounded-md bg-primary/10">
                <Icon className="size-5" aria-hidden />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-foreground">
              <AnimatedNumber value={value} format={FORMATTERS[format]} />
            </p>
            <CardDescription>{hint}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
