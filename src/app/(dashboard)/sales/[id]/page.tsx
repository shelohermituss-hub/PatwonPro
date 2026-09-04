"use client";

import { use } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft, Receipt } from "lucide-react";
import { db } from "@/lib/db";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/pos/labels";
import type { PaymentStatus } from "@/types";

const STATUS_BADGE_CLASS: Record<PaymentStatus, string> = {
  paid: "border-transparent bg-success/10 text-success",
  partial: "border-transparent bg-warning/10 text-warning",
  credit: "border-transparent bg-warning/10 text-warning",
};

export default function SaleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // Dexie's .get() resolves to `undefined` both while the query hasn't run
  // yet AND when the id truly doesn't exist — wrapping the result is what
  // makes those two cases distinguishable below (same pattern as the
  // product edit page).
  const result = useLiveQuery(async () => {
    const sale = await db.sales.get(id);
    if (!sale) return { found: false as const };

    const [items, customer] = await Promise.all([
      db.saleItems.where("sale_id").equals(id).toArray(),
      sale.customer_id ? db.customers.get(sale.customer_id) : undefined,
    ]);
    const products = await db.products.bulkGet(items.map((i) => i.product_id));
    const itemsWithNames = items.map((item, index) => ({
      ...item,
      productName: products[index]?.name ?? "Pwodwi efase",
    }));

    return { found: true as const, sale, items: itemsWithNames, customer };
  }, [id]);

  if (result === undefined) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!result.found) {
    return (
      <div className="flex flex-col items-center gap-3 p-16 text-center">
        <Receipt className="size-10 text-text-secondary" aria-hidden />
        <p className="font-medium text-foreground">Nou pa jwenn vant sa a</p>
        <p className="text-sm text-text-secondary">
          Li ka efase, oswa li poko senkwonize sou aparèy sa a.
        </p>
        <Link href="/sales" className={cn(buttonVariants(), "mt-2 min-h-12")}>
          Tounen nan Istorik Vant
        </Link>
      </div>
    );
  }

  const { sale, items, customer } = result;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <Link
          href="/sales"
          aria-label="Tounen nan istorik vant"
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
        >
          <ArrowLeft className="size-4" aria-hidden />
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold text-foreground">
            Vant · {formatDateTime(sale.created_at)}
          </h1>
          <p className="text-text-secondary">
            {customer ? customer.full_name : "Kliyan jenerik"}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`ml-auto ${STATUS_BADGE_CLASS[sale.payment_status]}`}
        >
          {PAYMENT_STATUS_LABELS[sale.payment_status]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-surface p-4 sm:grid-cols-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-text-secondary">Mwayen Peman</span>
          <span className="font-medium text-foreground">
            {PAYMENT_METHOD_LABELS[sale.payment_method]}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-text-secondary">Soutotal</span>
          <span className="font-medium text-foreground">
            {formatCurrency(sale.subtotal)}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-text-secondary">Rabè</span>
          <span className="font-medium text-foreground">
            {formatCurrency(sale.discount)}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-text-secondary">Total</span>
          <span className="text-lg font-bold text-foreground">
            {formatCurrency(sale.total)}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pwodwi</TableHead>
              <TableHead>Kantite</TableHead>
              <TableHead>Pri Inite</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-foreground">
                  {item.productName}
                </TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                <TableCell>{formatCurrency(item.line_total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
