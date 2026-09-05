"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, type AdminColumn, type AdminFilter } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MOCK_LEADS } from "@/lib/admin/mock/leads";
import { LEAD_STAGE_LABELS } from "@/lib/admin/labels";
import type { Lead, LeadStage } from "@/types/admin";

const STAGE_OPTIONS = Object.entries(LEAD_STAGE_LABELS).map(([value, meta]) => ({ value, label: meta.label }));
const AGENT_OPTIONS = Array.from(new Set(MOCK_LEADS.map((l) => l.agentName))).map((a) => ({ value: a, label: a }));

const FILTERS: AdminFilter<Lead>[] = [
  { id: "stage", label: "Etap", options: STAGE_OPTIONS, predicate: (row, v) => row.stage === (v as LeadStage) },
  { id: "agent", label: "Ajan", options: AGENT_OPTIONS, predicate: (row, v) => row.agentName === v },
];

const COLUMNS: AdminColumn<Lead>[] = [
  { id: "store", header: "Boutik", csvValue: (r) => r.storeName, cell: (r) => (
    <div className="flex flex-col">
      <span className="font-medium text-foreground">{r.storeName}</span>
      <span className="text-xs text-text-secondary">{r.ownerName}</span>
    </div>
  ) },
  { id: "contact", header: "Kontak", csvValue: (r) => r.phone, cell: (r) => r.phone },
  { id: "zone", header: "Zòn", csvValue: (r) => r.zone, cell: (r) => r.zone },
  { id: "type", header: "Tip Komès", csvValue: (r) => r.businessType, cell: (r) => r.businessType },
  { id: "stage", header: "Etap Pipeline", csvValue: (r) => LEAD_STAGE_LABELS[r.stage].label, cell: (r) => <StatusBadge {...LEAD_STAGE_LABELS[r.stage]} /> },
  { id: "agent", header: "Ajan", csvValue: (r) => r.agentName, cell: (r) => r.agentName },
  { id: "lastInteraction", header: "Dènye Kontak", csvValue: (r) => r.lastInteractionAt, cell: (r) => new Date(r.lastInteractionAt).toLocaleDateString("fr-HT") },
];

export default function LeadsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <AdminPageHeader
        title="Lead"
        description="Pipeline konplè: Lead → Kontakte → Demo → Esè → Konvèti/Pèdi."
      />

      <AdminDataTable
        data={MOCK_LEADS}
        columns={COLUMNS}
        filters={FILTERS}
        searchPlaceholder="Chèche pa non boutik oswa pwopriyetè..."
        searchPredicate={(row, q) => row.storeName.toLowerCase().includes(q) || row.ownerName.toLowerCase().includes(q)}
        getRowKey={(row) => row.id}
        exportFilename="lead.csv"
        emptyTitle="Pa gen lead ki matche"
      />
    </div>
  );
}
