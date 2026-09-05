"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { Icons } from "@/lib/icons";
import { EmptyState } from "@/components/EmptyState";
import { db } from "@/lib/db";
import { pullCustomers } from "@/lib/sync/customers";
import { pullCreditPayments } from "@/lib/sync/creditPayments";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { computeCreditStatus, type CreditStatus } from "@/lib/credits/status";
import { CREDIT_STATUS_LABELS } from "@/lib/credits/labels";
import { CreditStatusBadge } from "@/components/CreditStatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
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

const STATUS_TABS: { value: CreditStatus | "all"; label: string }[] = [
  { value: "all", label: "Tout" },
  { value: "overdue", label: CREDIT_STATUS_LABELS.overdue },
  { value: "active", label: CREDIT_STATUS_LABELS.active },
  { value: "paid", label: CREDIT_STATUS_LABELS.paid },
];

const STATUS_PRIORITY: Record<CreditStatus, number> = { overdue: 0, active: 1, paid: 2 };

export default function CreditsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CreditStatus | "all">("all");

  const { profile } = useCurrentProfile();
  const sales = useLiveQuery(() => db.sales.toArray(), []);
  const payments = useLiveQuery(() => db.creditPayments.toArray(), []);
  const customers = useLiveQuery(() => db.customers.toArray(), []);

  useEffect(() => {
    if (!profile?.store_id) return;
    void pullCustomers(profile.store_id);
    void pullCreditPayments(profile.store_id);
  }, [profile?.store_id]);

  const customerNameById = useMemo(
    () => new Map((customers ?? []).map((c) => [c.id, c.full_name])),
    [customers],
  );

  const credits = useMemo(() => {
    if (!sales || !payments) return undefined;
    return sales
      .filter((s) => s.payment_method === "credit")
      .map((sale) => {
        const paid = payments
          .filter((p) => p.sale_id === sale.id)
          .reduce((sum, p) => sum + p.amount, 0);
        const remaining = Math.max(sale.total - paid, 0);
        return {
          sale,
          paid,
          remaining,
          status: computeCreditStatus(remaining, sale.created_at),
        };
      });
  }, [sales, payments]);

  const filtered = useMemo(() => {
    if (!credits) return undefined;
    const term = search.trim().toLowerCase();
    return credits
      .filter(({ sale, status }) => {
        if (statusFilter !== "all" && status !== statusFilter) return false;
        if (!term) return true;
        const customerName = sale.customer_id
          ? (customerNameById.get(sale.customer_id) ?? "").toLowerCase()
          : "";
        return customerName.includes(term);
      })
      .sort((a, b) => {
        const priorityDiff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
        if (priorityDiff !== 0) return priorityDiff;
        return b.remaining - a.remaining;
      });
  }, [credits, search, statusFilter, customerNameById]);

  const overdue = useMemo(
    () => (credits ?? []).filter((c) => c.status === "overdue"),
    [credits],
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold text-foreground">Kredi</h1>
          <p className="text-text-secondary">Jere dèt kliyan yo.</p>
        </div>
        <Link href="/credits/new" className={cn(buttonVariants(), "min-h-12")}>
          <Icons.add data-icon="inline-start" aria-hidden />
          Nouvo Kredi
        </Link>
      </div>

      {overdue.length > 0 && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-danger"
        >
          <Icons.alert className="size-5 shrink-0" aria-hidden />
          <p className="text-sm font-medium">
            {overdue.length} kredi an reta pou yon total{" "}
            {formatCurrency(overdue.reduce((sum, c) => sum + c.remaining, 0))}.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Icons.search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Chèche pa kliyan..."
            className="pl-9"
            aria-label="Chèche yon kredi"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map(({ value, label }) => (
            <Button
              key={value}
              type="button"
              variant={statusFilter === value ? "default" : "outline"}
              onClick={() => setStatusFilter(value)}
              className="min-h-11"
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {filtered === undefined ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          illustration="credit"
          title={
            credits && credits.length > 0
              ? "Pa gen kredi ki matche filtè yo"
              : "Ou poko gen kredi"
          }
          description={
            credits && credits.length > 0
              ? "Eseye chanje filtè yo."
              : "Kreye premye kredi ou pou swiv dèt kliyan yo."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kliyan</TableHead>
                <TableHead>Dat</TableHead>
                <TableHead>Kantite</TableHead>
                <TableHead>Peye</TableHead>
                <TableHead>Rès</TableHead>
                <TableHead>Estati</TableHead>
                <TableHead className="w-12">
                  <span className="sr-only">Detay</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(({ sale, paid, remaining, status }) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium text-foreground">
                    {sale.customer_id
                      ? customerNameById.get(sale.customer_id) ?? "—"
                      : "—"}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {formatDateTime(sale.created_at)}
                  </TableCell>
                  <TableCell>{formatCurrency(sale.total)}</TableCell>
                  <TableCell>{formatCurrency(paid)}</TableCell>
                  <TableCell className="font-medium text-foreground">
                    {formatCurrency(remaining)}
                  </TableCell>
                  <TableCell>
                    <CreditStatusBadge status={status} />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/credits/${sale.id}`}
                      aria-label={`Wè detay kredi ${sale.customer_id ? customerNameById.get(sale.customer_id) ?? "" : ""}`}
                      className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                    >
                      Wè
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
