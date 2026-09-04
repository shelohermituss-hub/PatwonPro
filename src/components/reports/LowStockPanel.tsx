import Link from "next/link";
import { PackageX } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { StockBadge } from "@/components/StockBadge";
import type { Product } from "@/types";

export function LowStockPanel({ products }: { products: Product[] }) {
  const visible = products.slice(0, 8);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alèt Stòk Ba</CardTitle>
        <CardDescription>Pwodwi ki bezwen reapwovizyone</CardDescription>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <PackageX className="size-8 text-text-secondary" aria-hidden />
            <p className="text-sm text-text-secondary">Tout pwodwi gen ase stòk.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {visible.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3">
                <Link
                  href={`/products/${p.id}/edit`}
                  className="text-sm font-medium text-foreground hover:underline"
                >
                  {p.name}
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-secondary">
                    {p.stock_quantity} {p.unit}
                  </span>
                  <StockBadge
                    stockQuantity={p.stock_quantity}
                    lowStockThreshold={p.low_stock_threshold}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
        {products.length > visible.length && (
          <Link
            href="/products"
            className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
          >
            Wè tout ({products.length}) →
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
