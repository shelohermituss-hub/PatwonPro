"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, PackageCheck, Wrench, AlertTriangle, RotateCcw } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, type AdminColumn, type AdminFilter } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DEVICE_STATUS_LABELS } from "@/lib/admin/labels";
import { markDeviceReady, reserveDevice, logDeviceRepair, reportDeviceLost } from "@/lib/admin/mutations/devices";
import { formatCurrencyHTG } from "@/lib/format";
import type { AdminDevice, DeviceStatusAdmin } from "@/types/admin";

type ActionKind = "mark_ready" | "reserve" | "repair" | "lost";

const ACTION_CONFIG: Record<ActionKind, { title: string; description: string; confirmLabel: string; destructive?: boolean; auditAction: string; successMessage: string; mutate: (dbId: string) => Promise<void> }> = {
  mark_ready: {
    title: "Make tablèt la pare pou enstalasyon",
    description: "Tablèt la ap parèt kòm disponib pou yon nouvo enstalasyon.",
    confirmLabel: "Make pare",
    auditAction: "device.marked_ready",
    successMessage: "Tablèt make pare.",
    mutate: markDeviceReady,
  },
  reserve: {
    title: "Rezève tablèt la pou yon esè",
    description: "Tablèt la ap kenbe pou pwochen enstalasyon planifye a.",
    confirmLabel: "Rezève",
    auditAction: "device.reserved",
    successMessage: "Tablèt rezève.",
    mutate: reserveDevice,
  },
  repair: {
    title: "Anrejistre yon reparasyon",
    description: "Tablèt la ap pase an estati 'An reparasyon'.",
    confirmLabel: "Konfime",
    auditAction: "device.repair_logged",
    successMessage: "Reparasyon anrejistre.",
    mutate: logDeviceRepair,
  },
  lost: {
    title: "Siyale vòl oswa pèt",
    description: "Aksyon sa a make tablèt la kòm pèdi de fason pèmanan nan envantè a.",
    confirmLabel: "Siyale Pèdi",
    destructive: true,
    auditAction: "device.reported_lost",
    successMessage: "Tablèt make pèdi.",
    mutate: reportDeviceLost,
  },
};

function DevicesContent({ devices }: { devices: AdminDevice[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawStatus = searchParams.get("status");
  const initialStatus = rawStatus === "deployed" ? "deployed_active" : rawStatus;
  const [pending, setPending] = useState<{ device: AdminDevice; kind: ActionKind } | null>(null);

  const STATUS_OPTIONS = Object.entries(DEVICE_STATUS_LABELS).map(([value, meta]) => ({ value, label: meta.label }));
  const BRAND_OPTIONS = Array.from(new Set(devices.map((d) => d.brand))).map((b) => ({ value: b, label: b }));

  const FILTERS: AdminFilter<AdminDevice>[] = [
    { id: "status", label: "Estati", options: STATUS_OPTIONS, predicate: (row, v) => row.status === (v as DeviceStatusAdmin) },
    { id: "brand", label: "Mak", options: BRAND_OPTIONS, predicate: (row, v) => row.brand === v },
  ];

  const columns: AdminColumn<AdminDevice>[] = [
    { id: "id", header: "Device ID", csvValue: (r) => r.id, cell: (r) => <span className="font-medium">{r.id}</span> },
    { id: "brand", header: "Mak / Modèl", csvValue: (r) => `${r.brand} ${r.model}`, cell: (r) => `${r.brand} ${r.model}` },
    { id: "status", header: "Estati", csvValue: (r) => DEVICE_STATUS_LABELS[r.status].label, cell: (r) => <StatusBadge {...DEVICE_STATUS_LABELS[r.status]} /> },
    { id: "store", header: "Boutik Asiyen", csvValue: (r) => r.assignedStoreName ?? "—", cell: (r) => r.assignedStoreName ?? "—" },
    { id: "cost", header: "Kou Reyèl", csvValue: (r) => r.actualCostHtg, cell: (r) => formatCurrencyHTG(r.actualCostHtg) },
    { id: "purchase", header: "Dat Achte", csvValue: (r) => r.purchaseDate, cell: (r) => r.purchaseDate || "—" },
    { id: "repairs", header: "Reparasyon", csvValue: (r) => r.repairHistory.length, cell: (r) => (r.repairHistory.length > 0 ? `${r.repairHistory.length}` : "—") },
    { id: "actions", header: "Aksyon", cell: (r) => (
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
          Aksyon
          <ChevronDown data-icon="inline-end" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setPending({ device: r, kind: "mark_ready" })}>
            <PackageCheck data-icon="inline-start" aria-hidden />
            Make pare pou enstalasyon
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPending({ device: r, kind: "reserve" })}>
            <RotateCcw data-icon="inline-start" aria-hidden />
            Rezève pou esè
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPending({ device: r, kind: "repair" })}>
            <Wrench data-icon="inline-start" aria-hidden />
            Anrejistre reparasyon
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPending({ device: r, kind: "lost" })} variant="destructive">
            <AlertTriangle data-icon="inline-start" aria-hidden />
            Siyale vòl / pèt
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ) },
  ];

  const config = pending ? ACTION_CONFIG[pending.kind] : null;

  return (
    <div className="flex flex-col gap-6 p-6">
      <AdminPageHeader title="Aparèy" description="Pak tablèt yo — enstalasyon, rezèv, reparasyon, ak pèt." />

      <AdminDataTable
        data={devices}
        columns={columns}
        filters={FILTERS}
        initialFilterValues={initialStatus ? { status: initialStatus } : undefined}
        searchPlaceholder="Chèche pa Device ID oswa nimewo seri..."
        searchPredicate={(row, q) => row.id.toLowerCase().includes(q) || row.serialNumber.toLowerCase().includes(q)}
        getRowKey={(row) => row.id}
        exportFilename="aparèy.csv"
        emptyTitle="Pa gen aparèy ki matche"
      />

      {pending && config && (
        <ConfirmActionDialog
          open
          onOpenChange={(open) => !open && setPending(null)}
          title={config.title}
          description={config.description}
          confirmLabel={config.confirmLabel}
          destructive={config.destructive}
          action={config.auditAction}
          resourceType="device"
          resourceId={pending.device.id}
          storeId={pending.device.assignedStoreId}
          successMessage={config.successMessage}
          onConfirm={() => config.mutate(pending.device.dbId)}
          onConfirmed={() => { setPending(null); router.refresh(); }}
        />
      )}
    </div>
  );
}

export function DevicesClient({ devices }: { devices: AdminDevice[] }) {
  return (
    <Suspense>
      <DevicesContent devices={devices} />
    </Suspense>
  );
}
