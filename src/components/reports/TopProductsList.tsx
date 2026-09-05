import { EmptyState } from "@/components/EmptyState";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { TopProductRow } from "@/lib/reports/queries";

export function TopProductsList({ products }: { products: TopProductRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pwodwi ki pi vann</CardTitle>
        <CardDescription>Top 10 pa valè vant sou peryòd la</CardDescription>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <EmptyState
            title="Pa gen vant pwodwi sou peryòd sa a."
            compact
            className="border-none py-6"
          />
        ) : (
          <ol className="flex flex-col gap-3">
            {products.map((p, index) => (
              <li key={p.product_id} className="flex items-center gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-text-secondary">
                  {index + 1}
                </span>
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {p.product_name}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {p.quantity_sold} vann
                  </span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(p.total_value)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
