"use client";

import { useState } from "react";
import { RefreshCw, Ticket } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, type AdminColumn } from "@/components/admin/AdminDataTable";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MOCK_SYNC_HEALTH } from "@/lib/admin/mock/sync";
import { formatDateTime } from "@/lib/format";
import { ADMIN_MOCK_NOW } from "@/lib/admin/now";
import type { SyncHealthRow } from "@/types/admin";

function daysSince(iso: string) {
  return Math.floor((ADMIN_MOCK_NOW - new Date(iso).getTime()) / 86_400_000);
}

export default function SyncPage() {
  const [pending, setPending] = useState<{ row: SyncHealthRow; kind: "ticket" | "resync" } | null>(null);

  const syncedLast24h = MOCK_SYNC_HEALTH.filter((r) => daysSince(r.lastSyncAt) < 1).length;
  const offline3d = MOCK_SYNC_HEALTH.filter((r) => daysSince(r.lastSyncAt) > 3).length;
  const pendingActions = MOCK_SYNC_HEALTH.reduce((sum, r) => sum + r.pendingActions, 0);
  const errorCount = MOCK_SYNC_HEALTH.reduce((sum, r) => sum + r.errors, 0);

  const columns: AdminColumn<SyncHealthRow>[] = [
    { id: "store", header: "Boutik", csvValue: (r) => r.storeName, cell: (r) => <span className="font-medium">{r.storeName}</span> },
    { id: "device", header: "Tablèt", csvValue: (r) => r.deviceId, cell: (r) => r.deviceId },
    { id: "sync", header: "Dènye Sync", csvValue: (r) => r.lastSyncAt, cell: (r) => {
      const days = daysSince(r.lastSyncAt);
      return <span className={days > 3 ? "font-medium text-danger" : "text-text-secondary"}>{formatDateTime(r.lastSyncAt)}</span>;
    } },
    { id: "pending", header: "Aksyon An Atant", csvValue: (r) => r.pendingActions, cell: (r) => r.pendingActions },
    { id: "errors", header: "Erè", csvValue: (r) => r.errors, cell: (r) => (r.errors > 0 ? <span className="font-medium text-danger">{r.errors}</span> : "0") },
    { id: "action", header: "Aksyon", cell: (r) => (
      <div className="flex gap-1.5">
        {r.errors > 0 ? (
          <Button type="button" variant="outline" size="sm" onClick={() => setPending({ row: r, kind: "ticket" })}>
            <Ticket data-icon="inline-start" aria-hidden />
            Kreye Tikè
          </Button>
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={() => setPending({ row: r, kind: "resync" })}>
            <RefreshCw data-icon="inline-start" aria-hidden />
            Relanse Sync
          </Button>
        )}
      </div>
    ) },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <AdminPageHeader title="Sant Senkwonizasyon" description="Detekte pwoblèm avan yo tounen pèt done." />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card><CardContent className="flex flex-col gap-1"><span className="text-xs text-text-secondary">Senkwonize Sou 24h</span><span className="text-xl font-bold text-success">{syncedLast24h}</span></CardContent></Card>
        <Card><CardContent className="flex flex-col gap-1"><span className="text-xs text-text-secondary">Offline &gt; 3 Jou</span><span className="text-xl font-bold text-danger">{offline3d}</span></CardContent></Card>
        <Card><CardContent className="flex flex-col gap-1"><span className="text-xs text-text-secondary">Aksyon An Atant</span><span className="text-xl font-bold">{pendingActions}</span></CardContent></Card>
        <Card><CardContent className="flex flex-col gap-1"><span className="text-xs text-text-secondary">Erè Sync</span><span className="text-xl font-bold text-danger">{errorCount}</span></CardContent></Card>
      </div>

      <AdminDataTable
        data={MOCK_SYNC_HEALTH}
        columns={columns}
        searchPlaceholder="Chèche pa non boutik..."
        searchPredicate={(row, q) => row.storeName.toLowerCase().includes(q)}
        getRowKey={(row) => row.storeId}
        exportFilename="sync.csv"
        emptyTitle="Pa gen boutik ki matche"
      />

      {pending && (
        <ConfirmActionDialog
          open
          onOpenChange={(open) => !open && setPending(null)}
          title={pending.kind === "ticket" ? "Kreye yon tikè sipò" : "Relanse senkwonizasyon"}
          description={
            pending.kind === "ticket"
              ? `Yon tikè P1 ap kreye pou ${pending.row.storeName} akoz erè senkwonizasyon.`
              : `Voye yon kòmand senkwonizasyon fòse bay tablèt ${pending.row.deviceId}.`
          }
          confirmLabel={pending.kind === "ticket" ? "Kreye Tikè" : "Relanse"}
          action={pending.kind === "ticket" ? "sync.ticket_created" : "sync.resync_triggered"}
          resourceType="sync"
          resourceId={pending.row.deviceId}
          storeId={pending.row.storeId}
          successMessage={pending.kind === "ticket" ? "Tikè kreye." : "Kòmand senkwonizasyon voye."}
        />
      )}
    </div>
  );
}
