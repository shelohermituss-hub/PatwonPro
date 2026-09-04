"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, Search, PackageX, TriangleAlert, MoreVertical } from "lucide-react";
import { db } from "@/lib/db";
import { pullProducts } from "@/lib/sync/products";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { isOwner } from "@/lib/auth/roles";
import { formatCurrency } from "@/lib/format";
import { StockBadge } from "@/components/StockBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [pullError, setPullError] = useState(false);

  const { profile } = useCurrentProfile();
  const products = useLiveQuery(() => db.products.toArray(), []);
  const categories = useLiveQuery(() => db.categories.toArray(), []);

  useEffect(() => {
    if (!profile?.store_id) return;
    pullProducts(profile.store_id).then(({ error }) => setPullError(!!error));
  }, [profile?.store_id]);

  const filtered = useMemo(() => {
    if (!products) return undefined;
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryId !== "all" && p.category_id !== categoryId) return false;
      if (lowStockOnly && p.stock_quantity > p.low_stock_threshold) return false;
      if (!term) return true;
      return (
        p.name.toLowerCase().includes(term) ||
        (p.sku ?? "").toLowerCase().includes(term)
      );
    });
  }, [products, search, categoryId, lowStockOnly]);

  const categoryNameById = useMemo(
    () => new Map((categories ?? []).map((c) => [c.id, c.name])),
    [categories],
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold text-foreground">Pwodwi</h1>
          <p className="text-text-secondary">Jere envantè boutik ou.</p>
        </div>
        {isOwner(profile) && (
          <div className="flex items-center gap-2">
            <Link
              href="/products/categories"
              className={cn(buttonVariants({ variant: "outline" }), "min-h-12")}
            >
              Kategori
            </Link>
            <Link href="/products/new" className={cn(buttonVariants(), "min-h-12")}>
              <Plus data-icon="inline-start" aria-hidden />
              Ajoute Pwodwi
            </Link>
          </div>
        )}
      </div>

      {pullError && (
        <div
          role="alert"
          className="rounded-md border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning"
        >
          Nou pa t ka mete lis la ajou. W ap wè dènye done ki sovgade sou
          aparèy la.
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Chèche pa non oswa SKU..."
            className="pl-9"
            aria-label="Chèche yon pwodwi"
          />
        </div>

        <Select
          value={categoryId}
          onValueChange={(value) => setCategoryId(value ?? "all")}
        >
          <SelectTrigger className="min-h-12 w-48" aria-label="Filtre pa kategori">
            <SelectValue placeholder="Tout kategori">
              {(value: string) =>
                value === "all" ? "Tout kategori" : categoryNameById.get(value) ?? "Tout kategori"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Tout kategori</SelectItem>
              {(categories ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant={lowStockOnly ? "default" : "outline"}
          onClick={() => setLowStockOnly((v) => !v)}
          className="min-h-12"
        >
          <TriangleAlert data-icon="inline-start" aria-hidden />
          Stòk ba sèlman
        </Button>
      </div>

      {filtered === undefined ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
          <PackageX className="size-10 text-text-secondary" aria-hidden />
          <div className="flex flex-col gap-1">
            <p className="font-medium text-foreground">
              {products && products.length > 0
                ? "Pa gen pwodwi ki matche rechèch la"
                : "Ou poko gen pwodwi"}
            </p>
            <p className="text-sm text-text-secondary">
              {products && products.length > 0
                ? "Eseye chanje filtè yo."
                : "Ajoute premye pwodwi ou pou kòmanse vann."}
            </p>
          </div>
          {isOwner(profile) && (!products || products.length === 0) && (
            <Link
              href="/products/new"
              className={cn(buttonVariants(), "mt-2 min-h-12")}
            >
              <Plus data-icon="inline-start" aria-hidden />
              Ajoute premye pwodwi ou
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pwodwi</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Pri Vann</TableHead>
                <TableHead>Stòk</TableHead>
                <TableHead className="w-12">
                  <span className="sr-only">Aksyon</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {product.name}
                      </span>
                      {product.sku && (
                        <span className="text-xs text-text-secondary">
                          SKU {product.sku}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {product.category_id
                      ? categoryNameById.get(product.category_id) ?? "—"
                      : "—"}
                  </TableCell>
                  <TableCell>{formatCurrency(product.sale_price)}</TableCell>
                  <TableCell>
                    <StockBadge
                      stockQuantity={product.stock_quantity}
                      lowStockThreshold={product.low_stock_threshold}
                    />
                  </TableCell>
                  <TableCell>
                    {isOwner(profile) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`Aksyon pou ${product.name}`}
                            />
                          }
                        >
                          <MoreVertical className="size-4" aria-hidden />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuItem
                              render={<Link href={`/products/${product.id}/edit`} />}
                            >
                              Modifye
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
