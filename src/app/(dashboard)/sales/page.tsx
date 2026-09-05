"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { Icons } from "@/lib/icons";
import { EmptyState } from "@/components/EmptyState";
import { db } from "@/lib/db";
import { pullCustomers } from "@/lib/sync/customers";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/pos/labels";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import type { PaymentMethod, PaymentStatus } from "@/types";

const DATE_RANGES = {
  today: "Jodi a",
  "7d": "7 jou",
  "30d": "30 jou",
  all: "Tout",
} as const;

type DateRange = keyof typeof DATE_RANGES;

const STATUS_BADGE_CLASS: Record<PaymentStatus, string> = {
  paid: "border-transparent bg-success/10 text-success",
  partial: "border-transparent bg-warning/10 text-warning",
  credit: "border-transparent bg-warning/10 text-warning",
};

function rangeStart(range: DateRange): Date | null {
  if (range === "all") return null;
  const now = new Date();
  if (range === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  const days = range === "7d" ? 7 : 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

export default function SalesHistoryPage() {
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "all">("all");
  const [dateRange, setDateRange] = useState<DateRange>("today");

  const { profile } = useCurrentProfile();
  const sales = useLiveQuery(
    () => db.sales.orderBy("created_at").reverse().toArray(),
    [],
  );
  const customers = useLiveQuery(() => db.customers.toArray(), []);

  useEffect(() => {
    if (!profile?.store_id) return;
    void pullCustomers(profile.store_id);
  }, [profile?.store_id]);

  const customerNameById = useMemo(
    () => new Map((customers ?? []).map((c) => [c.id, c.full_name])),
    [customers],
  );

  const filtered = useMemo(() => {
    if (!sales) return undefined;
    const term = search.trim().toLowerCase();
    const since = rangeStart(dateRange);
    return sales.filter((sale) => {
      if (paymentMethod !== "all" && sale.payment_method !== paymentMethod) {
        return false;
      }
      if (since && new Date(sale.created_at) < since) return false;
      if (!term) return true;
      const customerName = sale.customer_id
        ? (customerNameById.get(sale.customer_id) ?? "").toLowerCase()
        : "";
      return (
        customerName.includes(term) || sale.id.toLowerCase().startsWith(term)
      );
    });
  }, [sales, search, paymentMethod, dateRange, customerNameById]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold text-foreground">
            Istorik Vant
          </h1>
          <p className="text-text-secondary">Tout vant ki fèt nan boutik ou.</p>
        </div>
        <Link href="/sales/new" className={cn(buttonVariants(), "min-h-12")}>
          <Icons.add data-icon="inline-start" aria-hidden />
          Nouvo Vant
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Icons.search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Chèche pa kliyan oswa nimewo vant..."
            className="pl-9"
            aria-label="Chèche yon vant"
          />
        </div>

        <Select
          value={paymentMethod}
          onValueChange={(value) =>
            setPaymentMethod((value as PaymentMethod | "all") ?? "all")
          }
        >
          <SelectTrigger className="min-h-12 w-48" aria-label="Filtre pa mwayen peman">
            <SelectValue placeholder="Tout peman">
              {(value: string) =>
                value === "all"
                  ? "Tout peman"
                  : PAYMENT_METHOD_LABELS[value as PaymentMethod]
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Tout peman</SelectItem>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={dateRange}
          onValueChange={(value) => setDateRange((value as DateRange) ?? "today")}
        >
          <SelectTrigger className="min-h-12 w-40" aria-label="Filtre pa dat">
            <SelectValue>{(value: DateRange) => DATE_RANGES[value]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {Object.entries(DATE_RANGES).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
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
            sales && sales.length > 0
              ? "Pa gen vant ki matche filtè yo"
              : "Ou poko gen vant"
          }
          description={
            sales && sales.length > 0
              ? "Eseye chanje filtè yo."
              : "Fè premye vant ou nan Pwen Vant lan."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dat</TableHead>
                <TableHead>Kliyan</TableHead>
                <TableHead>Peman</TableHead>
                <TableHead>Estati</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="w-12">
                  <span className="sr-only">Detay</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="text-text-secondary">
                    {formatDateTime(sale.created_at)}
                  </TableCell>
                  <TableCell>
                    {sale.customer_id
                      ? customerNameById.get(sale.customer_id) ?? "—"
                      : "Kliyan jenerik"}
                  </TableCell>
                  <TableCell>{PAYMENT_METHOD_LABELS[sale.payment_method]}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={STATUS_BADGE_CLASS[sale.payment_status]}
                    >
                      {PAYMENT_STATUS_LABELS[sale.payment_status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {formatCurrency(sale.total)}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/sales/${sale.id}`}
                      aria-label={`Wè detay vant ${formatDateTime(sale.created_at)}`}
                      className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
                    >
                      <Icons.next className="size-4" aria-hidden />
                    </Link>
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
