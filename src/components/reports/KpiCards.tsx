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

export function KpiCards({ summary }: { summary: ReportSummary }) {
  const cards = [
    {
      label: "Total Vant",
      value: summary.total_sales,
      format: formatCurrency,
      hint: "Total tout vant sou peryòd la",
      icon: Icons.sales,
    },
    {
      label: "Pwofi Estime",
      value: summary.estimated_profit,
      format: formatCurrency,
      hint: "Pri vant mwens pri achte",
      icon: Icons.trendUp,
    },
    {
      label: "Tranzaksyon",
      value: summary.transaction_count,
      format: (n: number) => String(n),
      hint: "Kantite vant sou peryòd la",
      icon: Icons.transactionCount,
    },
    {
      label: "Panye Mwayèn",
      value: summary.avg_basket,
      format: formatCurrency,
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
              <AnimatedNumber value={value} format={format} />
            </p>
            <CardDescription>{hint}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
