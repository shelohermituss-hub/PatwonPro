"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { Icons } from "@/lib/icons";
import { EmptyState } from "@/components/EmptyState";
import { db } from "@/lib/db";
import { pullProducts } from "@/lib/sync/products";
import { pullStockEntries } from "@/lib/sync/stockEntries";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { formatDateTime } from "@/lib/format";
import { isOwner } from "@/lib/auth/roles";
import { STOCK_ENTRY_TYPE_LABELS } from "@/lib/stock/labels";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function StockEntriesPage() {
  const [search, setSearch] = useState("");

  const { profile } = useCurrentProfile();
  const entries = useLiveQuery(() => db.stockEntries.toArray(), []);
  const products = useLiveQuery(() => db.products.toArray(), []);

  useEffect(() => {
    if (!profile?.store_id) return;
    void pullProducts(profile.store_id);
    void pullStockEntries(profile.store_id);
  }, [profile?.store_id]);

  const productNameById = useMemo(
    () => new Map((products ?? []).map((p) => [p.id, p.name])),
    [products],
  );

  const filtered = useMemo(() => {
    if (!entries) return undefined;
    const term = search.trim().toLowerCase();
    return entries
      .filter((e) => {
        if (!term) return true;
        const productName = (productNameById.get(e.product_id) ?? "").toLowerCase();
        return productName.includes(term);
      })
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [entries, search, productNameById]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold text-foreground">
            Antre Stòk ak Ajisteman
          </h1>
          <p className="text-text-secondary">
            Istorik rapwovizyonman, korije, ak ajisteman envantè.
          </p>
        </div>
        {isOwner(profile) && (
          <Link href="/stock-entries/new" className={cn(buttonVariants(), "min-h-12")}>
            <Icons.add data-icon="inline-start" aria-hidden />
            Nouvo Antre
          </Link>
        )}
      </div>

      <div className="relative min-w-[240px] max-w-sm">
        <Icons.search
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2"
          aria-hidden
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Chèche pa pwodwi..."
          className="pl-9"
          aria-label="Chèche yon antre stòk"
        />
      </div>

      {filtered === undefined ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={
            entries && entries.length > 0
              ? "Pa gen antre stòk ki matche rechèch la"
              : "Ou poko gen antre stòk"
          }
          description={
            entries && entries.length > 0
              ? "Eseye chanje rechèch la."
              : "Ajoute yon antre stòk pou swiv chanjman envantè yo."
          }
          action={
            isOwner(profile) && (!entries || entries.length === 0) ? (
              <Link
                href="/stock-entries/new"
                className={cn(buttonVariants(), "mt-2 min-h-12")}
              >
                <Icons.add data-icon="inline-start" aria-hidden />
                Ajoute premye antre a
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pwodwi</TableHead>
                <TableHead>Kalite</TableHead>
                <TableHead>Kantite</TableHead>
                <TableHead>Stòk apre</TableHead>
                <TableHead>Rezon</TableHead>
                <TableHead>Dat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium text-foreground">
                    {productNameById.get(entry.product_id) ?? "—"}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {STOCK_ENTRY_TYPE_LABELS[entry.entry_type]}
                  </TableCell>
                  <TableCell
                    className={
                      entry.quantity_delta > 0 ? "text-success" : "text-danger"
                    }
                  >
                    {entry.quantity_delta > 0 ? "+" : ""}
                    {entry.quantity_delta}
                  </TableCell>
                  <TableCell>{entry.stock_after}</TableCell>
                  <TableCell className="text-text-secondary">
                    {entry.reason ?? "—"}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {formatDateTime(entry.created_at)}
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
