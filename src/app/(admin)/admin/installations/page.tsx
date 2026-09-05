"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, type AdminColumn, type AdminFilter } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { MOCK_INSTALLATIONS } from "@/lib/admin/mock/installations";
import { INSTALLATION_STATUS_LABELS } from "@/lib/admin/labels";
import type { Installation, InstallationStatus } from "@/types/admin";

const STATUS_OPTIONS = Object.entries(INSTALLATION_STATUS_LABELS).map(([value, meta]) => ({ value, label: meta.label }));

const FILTERS: AdminFilter<Installation>[] = [
  { id: "status", label: "Estati", options: STATUS_OPTIONS, predicate: (row, v) => row.status === (v as InstallationStatus) },
];

export default function InstallationsPage() {
  const [selected, setSelected] = useState<Installation | null>(null);

  const columns: AdminColumn<Installation>[] = [
    { id: "store", header: "Boutik", csvValue: (r) => r.storeName, cell: (r) => <span className="font-medium">{r.storeName}</span> },
    { id: "contact", header: "Kontak", csvValue: (r) => r.contact, cell: (r) => r.contact },
    { id: "slot", header: "Kreno", csvValue: (r) => r.timeSlot, cell: (r) => r.timeSlot },
    { id: "agent", header: "Ajan", csvValue: (r) => r.agentName, cell: (r) => r.agentName },
    { id: "status", header: "Estati", csvValue: (r) => INSTALLATION_STATUS_LABELS[r.status].label, cell: (r) => <StatusBadge {...INSTALLATION_STATUS_LABELS[r.status]} /> },
    { id: "next", header: "Pwochen Aksyon", csvValue: (r) => r.nextAction, cell: (r) => <span className="text-sm text-text-secondary">{r.nextAction}</span> },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <AdminPageHeader title="Enstalasyon Teren" description="Chak enstalasyon suiv menm chèklis pou evite erè." />

      <AdminDataTable
        data={MOCK_INSTALLATIONS}
        columns={columns}
        filters={FILTERS}
        searchPlaceholder="Chèche pa non boutik..."
        searchPredicate={(row, q) => row.storeName.toLowerCase().includes(q)}
        getRowKey={(row) => row.id}
        onRowClick={(row) => setSelected(row)}
        exportFilename="enstalasyon.csv"
        emptyTitle="Pa gen enstalasyon planifye"
      />

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Chèklis — {selected?.storeName}</SheetTitle>
            <SheetDescription>{selected?.address}</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-3 px-4 pb-4">
            {selected?.checklist.map((item) => (
              <div key={item.label} className="flex items-center gap-2.5">
                {item.done ? (
                  <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden />
                ) : (
                  <Circle className="size-4 shrink-0 text-border" aria-hidden />
                )}
                <span className={item.done ? "text-text-secondary line-through" : "text-foreground"}>{item.label}</span>
              </div>
            ))}
            {selected?.trainingResult && (
              <p className="mt-2 rounded-md bg-muted p-3 text-sm text-foreground">
                <span className="font-medium">Rezilta fòmasyon : </span>
                {selected.trainingResult}
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
