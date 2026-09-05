"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Send, Pause } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, type AdminColumn, type AdminFilter } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SUBSCRIPTION_STATUS_LABELS } from "@/lib/admin/labels";
import { sendSubscriptionReminder, suspendSubscription } from "@/lib/admin/mutations/subscriptions";
import { formatCurrencyHTG } from "@/lib/format";
import type { AdminSubscription, AdminSubscriptionStatus } from "@/types/admin";

const STATUS_OPTIONS = Object.entries(SUBSCRIPTION_STATUS_LABELS).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

const FILTERS: AdminFilter<AdminSubscription>[] = [
  {
    id: "status",
    label: "Estati",
    options: STATUS_OPTIONS,
    predicate: (row, v) => row.status === (v as AdminSubscriptionStatus),
  },
];

function SubscriptionsContent({ subscriptions }: { subscriptions: AdminSubscription[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status");
  const [pending, setPending] = useState<AdminSubscription | null>(null);
  const [pendingKind, setPendingKind] = useState<"remind" | "suspend" | null>(null);

  const counts = STATUS_OPTIONS.map((opt) => ({
    ...opt,
    count: subscriptions.filter((s) => s.status === opt.value).length,
  }));

  const columns: AdminColumn<AdminSubscription>[] = [
    { id: "store", header: "Boutik", csvValue: (r) => r.storeName, cell: (r) => <span className="font-medium">{r.storeName}</span> },
    { id: "plan", header: "Plan", csvValue: (r) => r.plan, cell: (r) => <span className="capitalize">{r.plan}</span> },
    { id: "price", header: "Pri Mansyèl", csvValue: (r) => r.monthlyPriceHtg, cell: (r) => formatCurrencyHTG(r.monthlyPriceHtg) },
    { id: "status", header: "Estati", csvValue: (r) => SUBSCRIPTION_STATUS_LABELS[r.status].label, cell: (r) => <StatusBadge {...SUBSCRIPTION_STATUS_LABELS[r.status]} /> },
    { id: "due", header: "Pwochen Echeans", csvValue: (r) => r.nextDueDate, cell: (r) => r.nextDueDate || "—" },
    { id: "due_amount", header: "Montan Dwe", csvValue: (r) => r.amountDueHtg, cell: (r) => (r.amountDueHtg > 0 ? <span className="font-medium text-danger">{formatCurrencyHTG(r.amountDueHtg)}</span> : "—") },
    { id: "late", header: "Jou Reta", csvValue: (r) => r.daysLate, cell: (r) => (r.daysLate > 0 ? `${r.daysLate} jou` : "—") },
    { id: "agent", header: "Ajan", csvValue: (r) => r.collectionAgent, cell: (r) => r.collectionAgent },
    { id: "action", header: "Aksyon", cell: (r) => (
      <div className="flex gap-1.5">
        <Button type="button" variant="outline" size="sm" onClick={() => { setPending(r); setPendingKind("remind"); }}>
          <Send data-icon="inline-start" aria-hidden />
          Relanse
        </Button>
        {r.status !== "suspended" && r.status !== "canceled" && (
          <Button type="button" variant="outline" size="sm" onClick={() => { setPending(r); setPendingKind("suspend"); }}>
            <Pause data-icon="inline-start" aria-hidden />
            Sispann
          </Button>
        )}
      </div>
    ) },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <AdminPageHeader title="Abònman" description="Pilotaj revni mansyèl ak rekouvreman." />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {counts.map((c) => (
          <Card key={c.value}>
            <CardContent className="flex flex-col gap-1">
              <span className="text-xs text-text-secondary">{c.label}</span>
              <span className="text-xl font-bold">{c.count}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <AdminDataTable
        data={subscriptions}
        columns={columns}
        filters={FILTERS}
        initialFilterValues={initialStatus ? { status: initialStatus } : undefined}
        searchPlaceholder="Chèche pa non boutik..."
        searchPredicate={(row, q) => row.storeName.toLowerCase().includes(q)}
        getRowKey={(row) => row.id}
        exportFilename="abonman.csv"
        emptyTitle="Pa gen abònman ki matche"
      />

      {pending && pendingKind === "remind" && (
        <ConfirmActionDialog
          open
          onOpenChange={(open) => !open && setPending(null)}
          title={`Relanse ${pending.storeName}`}
          description="Voye yon mesaj rapèl WhatsApp/SMS bay pwopriyetè a."
          confirmLabel="Voye Relans"
          action="subscription.reminder_sent"
          resourceType="subscription"
          resourceId={pending.id}
          storeId={pending.storeId}
          successMessage="Relans voye."
          onConfirm={() => sendSubscriptionReminder(pending.id)}
          onConfirmed={() => { setPendingKind(null); router.refresh(); }}
        />
      )}
      {pending && pendingKind === "suspend" && (
        <ConfirmActionDialog
          open
          onOpenChange={(open) => !open && setPending(null)}
          title={`Sispann ${pending.storeName}`}
          description="Boutik la p ap ka itilize aplikasyon an jiskaske li peye oswa yon admin reyaktive li."
          confirmLabel="Sispann"
          destructive
          action="subscription.suspended"
          resourceType="subscription"
          resourceId={pending.id}
          storeId={pending.storeId}
          successMessage="Abònman sispann."
          onConfirm={() => suspendSubscription(pending.id)}
          onConfirmed={() => { setPendingKind(null); router.refresh(); }}
        />
      )}
    </div>
  );
}

export function SubscriptionsClient({ subscriptions }: { subscriptions: AdminSubscription[] }) {
  return (
    <Suspense>
      <SubscriptionsContent subscriptions={subscriptions} />
    </Suspense>
  );
}
