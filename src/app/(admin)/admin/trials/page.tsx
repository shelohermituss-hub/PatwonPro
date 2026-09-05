"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, type AdminColumn } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_LEADS } from "@/lib/admin/mock/leads";
import { LEAD_STAGE_LABELS } from "@/lib/admin/labels";
import { ADMIN_MOCK_NOW } from "@/lib/admin/now";
import type { Lead } from "@/types/admin";

const ACTIVE_TRIALS = MOCK_LEADS.filter((l) => l.stage === "trial_active" || l.stage === "trial_installed");

function daysRemaining(endDate: string | null): number | null {
  if (!endDate) return null;
  return Math.ceil((new Date(endDate).getTime() - ADMIN_MOCK_NOW) / 86_400_000);
}

const COLUMNS: AdminColumn<Lead>[] = [
  { id: "store", header: "Boutik", csvValue: (r) => r.storeName, cell: (r) => (
    <div className="flex flex-col">
      <span className="font-medium text-foreground">{r.storeName}</span>
      <span className="text-xs text-text-secondary">{r.ownerName}</span>
    </div>
  ) },
  { id: "stage", header: "Etap", csvValue: (r) => LEAD_STAGE_LABELS[r.stage].label, cell: (r) => <StatusBadge {...LEAD_STAGE_LABELS[r.stage]} /> },
  { id: "start", header: "Kòmanse", csvValue: (r) => r.trialStartDate ?? "—", cell: (r) => r.trialStartDate ?? "—" },
  { id: "end", header: "Fini", csvValue: (r) => r.trialEndDate ?? "—", cell: (r) => r.trialEndDate ?? "—" },
  { id: "remaining", header: "Jou Ki Rete", cell: (r) => {
    const days = daysRemaining(r.trialEndDate);
    if (days === null) return "—";
    return (
      <span className={days <= 3 ? "font-medium text-danger" : days <= 7 ? "font-medium text-warning" : "text-text-secondary"}>
        {days} jou
      </span>
    );
  } },
  { id: "agent", header: "Ajan", csvValue: (r) => r.agentName, cell: (r) => r.agentName },
];

export default function TrialsPage() {
  const endingSoon = ACTIVE_TRIALS.filter((t) => {
    const days = daysRemaining(t.trialEndDate);
    return days !== null && days <= 7;
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <AdminPageHeader
        title="Esè"
        description="Boutik ki nan 30 jou gratis la — rapèl J-7 relans WhatsApp, J-3 apèl obligatwa, J-1 vizit oswa konvèsyon."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-xs text-text-secondary">Esè Aktif</span>
            <span className="text-xl font-bold">{ACTIVE_TRIALS.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-xs text-text-secondary">Fini Nan 7 Jou</span>
            <span className="text-xl font-bold text-warning">{endingSoon.length}</span>
          </CardContent>
        </Card>
      </div>

      <AdminDataTable
        data={ACTIVE_TRIALS}
        columns={COLUMNS}
        searchPlaceholder="Chèche pa non boutik..."
        searchPredicate={(row, q) => row.storeName.toLowerCase().includes(q)}
        getRowKey={(row) => row.id}
        exportFilename="ese.csv"
        emptyTitle="Pa gen esè aktif kounye a"
      />
    </div>
  );
}
