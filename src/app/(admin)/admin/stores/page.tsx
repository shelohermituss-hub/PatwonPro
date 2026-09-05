"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, type AdminColumn, type AdminFilter } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MOCK_STORES } from "@/lib/admin/mock/stores";
import { STORE_STATUS_LABELS } from "@/lib/admin/labels";
import { formatCurrencyHTG, formatDateTime } from "@/lib/format";
import { ADMIN_MOCK_NOW } from "@/lib/admin/now";
import type { AdminStore } from "@/types/admin";

const STATUS_OPTIONS = Object.entries(STORE_STATUS_LABELS).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

const ZONE_OPTIONS = Array.from(new Set(MOCK_STORES.map((s) => s.zone))).map((zone) => ({
  value: zone,
  label: zone,
}));

const AGENT_OPTIONS = Array.from(new Set(MOCK_STORES.map((s) => s.agentName))).map((agent) => ({
  value: agent,
  label: agent,
}));

const FILTERS: AdminFilter<AdminStore>[] = [
  { id: "status", label: "Estati", options: STATUS_OPTIONS, predicate: (row, v) => row.subscriptionStatus === v },
  { id: "zone", label: "Zòn", options: ZONE_OPTIONS, predicate: (row, v) => row.zone === v },
  { id: "agent", label: "Ajan", options: AGENT_OPTIONS, predicate: (row, v) => row.agentName === v },
];

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  return Math.floor((ADMIN_MOCK_NOW - new Date(iso).getTime()) / 86_400_000);
}

const COLUMNS: AdminColumn<AdminStore>[] = [
  {
    id: "name",
    header: "Boutik",
    csvValue: (r) => r.name,
    cell: (r) => (
      <div className="flex flex-col">
        <span className="font-medium text-foreground">{r.name}</span>
        <span className="text-xs text-text-secondary">{r.ownerName}</span>
      </div>
    ),
  },
  {
    id: "contact",
    header: "Kontak",
    csvValue: (r) => r.phone,
    cell: (r) => <span className="text-sm">{r.phone}</span>,
  },
  {
    id: "zone",
    header: "Vil / Zòn",
    csvValue: (r) => `${r.city} · ${r.zone}`,
    cell: (r) => (
      <div className="flex flex-col text-sm">
        <span>{r.zone}</span>
        <span className="text-xs text-text-secondary">{r.businessType}</span>
      </div>
    ),
  },
  {
    id: "status",
    header: "Estati",
    csvValue: (r) => STORE_STATUS_LABELS[r.subscriptionStatus].label,
    cell: (r) => <StatusBadge {...STORE_STATUS_LABELS[r.subscriptionStatus]} />,
  },
  {
    id: "plan",
    header: "Plan / Pri",
    csvValue: (r) => `${r.plan} — ${r.monthlyPriceHtg}`,
    cell: (r) => (
      <div className="flex flex-col text-sm">
        <span className="capitalize">{r.plan}</span>
        <span className="text-xs text-text-secondary">{formatCurrencyHTG(r.monthlyPriceHtg)}/mwa</span>
      </div>
    ),
  },
  {
    id: "due",
    header: "Pwochen Echeans",
    csvValue: (r) => r.nextDueDate ?? "—",
    cell: (r) =>
      r.daysLate > 0 ? (
        <span className="text-sm font-medium text-danger">{r.daysLate} jou reta</span>
      ) : (
        <span className="text-sm text-text-secondary">{r.nextDueDate ?? "—"}</span>
      ),
  },
  {
    id: "lastSale",
    header: "Dènye Vant",
    csvValue: (r) => r.lastSaleAt ?? "—",
    cell: (r) => <span className="text-sm text-text-secondary">{r.lastSaleAt ? formatDateTime(r.lastSaleAt) : "—"}</span>,
  },
  {
    id: "sync",
    header: "Dènye Sync",
    csvValue: (r) => r.lastSyncAt ?? "—",
    cell: (r) => {
      const days = daysSince(r.lastSyncAt);
      return (
        <span className={days !== null && days > 3 ? "text-sm font-medium text-danger" : "text-sm text-text-secondary"}>
          {r.lastSyncAt ? formatDateTime(r.lastSyncAt) : "Jamè"}
        </span>
      );
    },
  },
  {
    id: "device",
    header: "Tablèt / Ajan",
    csvValue: (r) => `${r.deviceId ?? "—"} / ${r.agentName}`,
    cell: (r) => (
      <div className="flex flex-col text-sm">
        <span>{r.deviceId ?? "—"}</span>
        <span className="text-xs text-text-secondary">{r.agentName}</span>
      </div>
    ),
  },
];

function StoresPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status");

  return (
    <div className="flex flex-col gap-6 p-6">
      <AdminPageHeader title="Boutik" description="CRM operasyonèl — tout boutik ki sou platfòm nan." />

      <AdminDataTable
        data={MOCK_STORES}
        columns={COLUMNS}
        filters={FILTERS}
        initialFilterValues={initialStatus ? { status: initialStatus } : undefined}
        searchPlaceholder="Chèche pa non boutik, pwopriyetè oswa telefòn..."
        searchPredicate={(row, q) =>
          row.name.toLowerCase().includes(q) ||
          row.ownerName.toLowerCase().includes(q) ||
          row.phone.includes(q)
        }
        getRowKey={(row) => row.id}
        onRowClick={(row) => router.push(`/admin/stores/${row.id}`)}
        exportFilename="boutik.csv"
        emptyTitle="Pa gen boutik ki matche"
        emptyDescription="Eseye ajiste rechèch la oswa filt yo."
      />
    </div>
  );
}

export default function StoresPage() {
  return (
    <Suspense>
      <StoresPageContent />
    </Suspense>
  );
}
