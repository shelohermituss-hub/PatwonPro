"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, type AdminColumn } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";
import { NewNotificationCampaignSheet } from "@/components/admin/NewNotificationCampaignSheet";
import { useAdminActor } from "@/components/admin/AdminSessionProvider";
import { can } from "@/lib/admin/permissions";
import { deleteNotificationCampaign } from "@/lib/admin/actions/notificationCampaigns";
import {
  NOTIFICATION_CAMPAIGN_STATUS_LABELS,
  NOTIFICATION_CAMPAIGN_TARGET_SCOPE_LABELS,
  NOTIFICATION_CAMPAIGN_TRIGGER_TYPE_LABELS,
  NOTIFICATION_CAMPAIGN_TYPE_LABELS,
} from "@/lib/admin/labels";
import { formatDateTime } from "@/lib/format";
import type { NotificationCampaign } from "@/types/admin";
import type { UserOption } from "@/lib/admin/queries/notificationCampaigns";

export function NotificationsClient({
  campaigns,
  userOptions,
}: {
  campaigns: NotificationCampaign[];
  userOptions: UserOption[];
}) {
  const router = useRouter();
  const actor = useAdminActor();
  const readOnly = !can(actor.role, "manage_notifications");
  const [pendingDelete, setPendingDelete] = useState<NotificationCampaign | null>(null);

  const columns: AdminColumn<NotificationCampaign>[] = [
    { id: "title", header: "Tit", cell: (row) => <span className="font-medium text-foreground">{row.title}</span>, csvValue: (row) => row.title },
    {
      id: "target",
      header: "Kiyès",
      cell: (row) =>
        row.targetScope === "single_user"
          ? (row.targetProfileName ?? "Itilizatè efase")
          : NOTIFICATION_CAMPAIGN_TARGET_SCOPE_LABELS[row.targetScope],
      csvValue: (row) => NOTIFICATION_CAMPAIGN_TARGET_SCOPE_LABELS[row.targetScope],
    },
    {
      id: "type",
      header: "Kalite",
      cell: (row) => {
        const meta = NOTIFICATION_CAMPAIGN_TYPE_LABELS[row.notificationType];
        return <StatusBadge label={meta.label} tone={meta.tone} />;
      },
      csvValue: (row) => row.notificationType,
    },
    {
      id: "trigger",
      header: "Deklanchè",
      cell: (row) => NOTIFICATION_CAMPAIGN_TRIGGER_TYPE_LABELS[row.triggerType],
      csvValue: (row) => NOTIFICATION_CAMPAIGN_TRIGGER_TYPE_LABELS[row.triggerType],
    },
    {
      id: "status",
      header: "Estati",
      cell: (row) => {
        const meta = NOTIFICATION_CAMPAIGN_STATUS_LABELS[row.status];
        return <StatusBadge label={meta.label} tone={meta.tone} />;
      },
      csvValue: (row) => row.status,
    },
    {
      id: "lastDispatched",
      header: "Dènye voye",
      cell: (row) => (row.lastDispatchedAt ? formatDateTime(row.lastDispatchedAt) : "—"),
      csvValue: (row) => row.lastDispatchedAt ?? "",
    },
    {
      id: "actions",
      header: "",
      cell: (row) =>
        !readOnly && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Efase ${row.title}`}
            onClick={() => setPendingDelete(row)}
            className="size-8 text-text-secondary hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <AdminPageHeader
        title="Notifikasyon"
        description="Kreye epi pwograme anons pou boutik yo oswa ekip admin la."
        actions={!readOnly && <NewNotificationCampaignSheet userOptions={userOptions} />}
      />

      <AdminDataTable
        data={campaigns}
        columns={columns}
        getRowKey={(row) => row.id}
        searchPlaceholder="Chèche yon kanpay..."
        searchPredicate={(row, query) => row.title.toLowerCase().includes(query.toLowerCase())}
        emptyTitle="Pa gen kanpay notifikasyon"
        emptyDescription="Kreye premye kanpay ou a."
        exportFilename="notifikasyon.csv"
      />

      {pendingDelete && (
        <ConfirmActionDialog
          open
          onOpenChange={(open) => !open && setPendingDelete(null)}
          title="Efase kanpay sa a?"
          description={`"${pendingDelete.title}" ap efase — si li pwograme/repete, li ap sispann voye imedyatman.`}
          confirmLabel="Efase"
          destructive
          action="notification_campaign.deleted"
          resourceType="notification_campaign"
          resourceId={pendingDelete.id}
          successMessage="Kanpay efase."
          skipAutoAudit
          onConfirm={async () => {
            const result = await deleteNotificationCampaign(pendingDelete.id);
            if (result.error) throw new Error(result.error);
          }}
          onConfirmed={() => {
            setPendingDelete(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
