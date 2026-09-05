"use client";

import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Icons } from "@/lib/icons";
import { EmptyState } from "@/components/EmptyState";
import { db } from "@/lib/db";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types";

export function ProductGrid({
  onSelect,
}: {
  onSelect: (product: Product) => void;
}) {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");

  const products = useLiveQuery(() => db.products.toArray(), []);
  const categories = useLiveQuery(() => db.categories.toArray(), []);

  const filtered = useMemo(() => {
    if (!products) return undefined;
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      if (!p.is_active) return false;
      if (categoryId !== "all" && p.category_id !== categoryId) return false;
      if (!term) return true;
      return (
        p.name.toLowerCase().includes(term) ||
        (p.sku ?? "").toLowerCase().includes(term)
      );
    });
  }, [products, search, categoryId]);

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="relative">
        <Icons.search
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary"
          aria-hidden
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Chèche yon pwodwi pa non oswa SKU..."
          className="min-h-12 pl-9 text-base"
          aria-label="Chèche yon pwodwi"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={categoryId === "all" ? "default" : "outline"}
          onClick={() => setCategoryId("all")}
          className="min-h-10"
        >
          Tout
        </Button>
        {(categories ?? []).map((c) => (
          <Button
            key={c.id}
            type="button"
            variant={categoryId === c.id ? "default" : "outline"}
            onClick={() => setCategoryId(c.id)}
            className="min-h-10"
          >
            {c.name}
          </Button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {filtered === undefined ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={
              products && products.length > 0
                ? "Pa gen pwodwi ki matche rechèch la"
                : "Ou poko gen pwodwi aktif"
            }
            className="border-none"
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => {
              const outOfStock = product.stock_quantity <= 0;
              return (
                // Raw <button>, not shadcn Button: this is a full multi-line
                // card layout (flex-col, custom disabled/hover treatment),
                // not a fit for Button's single-line variant system.
                <button
                  key={product.id}
                  type="button"
                  onClick={() => onSelect(product)}
                  disabled={outOfStock}
                  className={cn(
                    "flex min-h-24 flex-col items-start justify-between gap-2 rounded-lg border border-border bg-surface p-3 text-left transition-colors",
                    "hover:border-primary hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                    "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border disabled:hover:bg-surface",
                  )}
                >
                  <div className="flex w-full items-start gap-2">
                    {product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage URLs aren't in next.config's image domains, and this is a small fixed-size thumbnail (no need for next/image's optimization pipeline).
                      <img
                        src={product.image_url}
                        alt=""
                        className="size-9 shrink-0 rounded-md border border-border object-cover"
                      />
                    ) : null}
                    <span className="line-clamp-2 text-sm font-medium text-foreground">
                      {product.name}
                    </span>
                  </div>
                  <div className="flex w-full items-end justify-between gap-2">
                    <span className="text-base font-bold text-foreground">
                      {formatCurrency(product.sale_price)}
                    </span>
                    {outOfStock ? (
                      <span className="text-xs font-medium text-danger">
                        San stòk
                      </span>
                    ) : product.stock_quantity <= product.low_stock_threshold ? (
                      <span className="text-xs font-medium text-warning">
                        Stòk ba
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
