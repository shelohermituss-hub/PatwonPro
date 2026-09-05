"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, type AdminColumn, type AdminFilter } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { MOCK_DEPOSITS } from "@/lib/admin/mock/deposits";
import { DEPOSIT_STATUS_LABELS } from "@/lib/admin/labels";
import { formatCurrencyHTG } from "@/lib/format";
import type { Deposit, DepositStatus } from "@/types/admin";

const PROCESS_STEPS = [
  "Kliyan mande fen kontra oswa kontra rive nan tèm",
  "Yon demann retou kreye",
  "Ajan teren enspekte aparèy la",
  "Chèklis, nimewo seri ak foto anrejistre",
  "Responsab valide desizyon an",
  "Finans ranbouse (cash, MonCash oswa NatCash)",
  "Resi jenere",
  "Antre kreye nan jounal odit",
  "Tablèt la pase an estòk, reparasyon oswa rekondisyone",
];

function currentStep(status: DepositStatus): number {
  switch (status) {
    case "received":
    case "held":
      return 1;
    case "eligible_for_refund":
      return 4;
    case "refund_requested":
      return 5;
    case "refunded":
    case "partially_retained":
    case "fully_retained":
      return 9;
  }
}

const STATUS_OPTIONS = Object.entries(DEPOSIT_STATUS_LABELS).map(([value, meta]) => ({ value, label: meta.label }));

const FILTERS: AdminFilter<Deposit>[] = [
  { id: "status", label: "Estati", options: STATUS_OPTIONS, predicate: (row, v) => row.status === v },
];

export default function DepositsPage() {
  const [selected, setSelected] = useState<Deposit | null>(null);

  const columns: AdminColumn<Deposit>[] = [
    { id: "store", header: "Boutik", csvValue: (r) => r.storeName, cell: (r) => <span className="font-medium">{r.storeName}</span> },
    { id: "contract", header: "Kontra", csvValue: (r) => r.contractNumber, cell: (r) => r.contractNumber },
    { id: "device", header: "Tablèt", csvValue: (r) => r.deviceId, cell: (r) => r.deviceId },
    { id: "amount", header: "Montan Kosyon", csvValue: (r) => r.amountHtg, cell: (r) => formatCurrencyHTG(r.amountHtg) },
    { id: "received", header: "Dat Resevwa", csvValue: (r) => r.receivedDate, cell: (r) => r.receivedDate },
    { id: "status", header: "Estati", csvValue: (r) => DEPOSIT_STATUS_LABELS[r.status].label, cell: (r) => <StatusBadge {...DEPOSIT_STATUS_LABELS[r.status]} /> },
    { id: "return", header: "Montan pou Rann", csvValue: (r) => r.amountToReturnHtg ?? "—", cell: (r) => (r.amountToReturnHtg != null ? formatCurrencyHTG(r.amountToReturnHtg) : "—") },
    { id: "process", header: "Pwosesis", cell: (r) => (
      <Button type="button" variant="outline" size="sm" onClick={() => setSelected(r)}>
        Wè pwosesis
      </Button>
    ) },
  ];

  const step = selected ? currentStep(selected.status) : 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      <AdminPageHeader
        title="Kosyon"
        description="Kosyon se yon obligasyon potansyèl anvè kliyan an — separe de revni Jere Boutik."
      />

      <AdminDataTable
        data={MOCK_DEPOSITS}
        columns={columns}
        filters={FILTERS}
        searchPlaceholder="Chèche pa non boutik oswa nimewo kontra..."
        searchPredicate={(row, q) => row.storeName.toLowerCase().includes(q) || row.contractNumber.toLowerCase().includes(q)}
        getRowKey={(row) => row.id}
        exportFilename="kosyon.csv"
        emptyTitle="Pa gen kosyon ki matche"
      />

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Pwosesis Kosyon — {selected?.storeName}</SheetTitle>
            <SheetDescription>
              Kontra {selected?.contractNumber} · Tablèt {selected?.deviceId}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-3 px-4 pb-4">
            {PROCESS_STEPS.map((label, i) => {
              const n = i + 1;
              const done = n < step;
              const isCurrent = n === step;
              return (
                <div key={label} className="flex items-start gap-2.5">
                  {done ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                  ) : (
                    <Circle className={`mt-0.5 size-4 shrink-0 ${isCurrent ? "text-primary" : "text-border"}`} aria-hidden />
                  )}
                  <span className={isCurrent ? "font-medium text-foreground" : done ? "text-text-secondary line-through" : "text-text-secondary"}>
                    {n}. {label}
                  </span>
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
