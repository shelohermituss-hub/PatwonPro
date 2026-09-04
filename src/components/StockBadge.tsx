import { Badge } from "@/components/ui/badge";

/**
 * Stock status pill for a product row. Never color-only (docs/UI_RULES.md
 * §3) — always carries text ("San stòk"/"Stòk ba"), not just a colored dot.
 */
export function StockBadge({
  stockQuantity,
  lowStockThreshold,
}: {
  stockQuantity: number;
  lowStockThreshold: number;
}) {
  if (stockQuantity <= 0) {
    return (
      <Badge variant="outline" className="border-transparent bg-danger/10 text-danger">
        San stòk
      </Badge>
    );
  }

  if (stockQuantity <= lowStockThreshold) {
    return (
      <Badge variant="outline" className="border-transparent bg-warning/10 text-warning">
        Stòk ba
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="border-transparent bg-success/10 text-success">
      An stòk
    </Badge>
  );
}
