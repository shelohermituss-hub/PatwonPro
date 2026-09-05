"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Circle, LoaderCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, type AdminColumn, type AdminFilter } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { depositSchema, type DepositFormInput, type DepositFormOutput } from "@/lib/validations/deposit";
import { createDeposit, updateDepositStatus } from "@/lib/admin/mutations/deposits";
import { DEPOSIT_STATUS_LABELS } from "@/lib/admin/labels";
import { formatCurrencyHTG, formatDateTime } from "@/lib/format";
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

function AddDepositSheet({ storeOptions, deviceOptions }: { storeOptions: { id: string; name: string }[]; deviceOptions: { id: string; label: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control: _control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DepositFormInput, unknown, DepositFormOutput>({
    resolver: zodResolver(depositSchema),
    defaultValues: { storeId: "", receivedDate: new Date().toISOString().slice(0, 10) },
  });
  void _control;

  async function onSubmit(values: DepositFormOutput) {
    setFormError(null);
    try {
      await createDeposit(values);
      toast.success("Kosyon anrejistre.");
      reset();
      setOpen(false);
      router.refresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Yon erè fèt.");
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button type="button" />}>
        <Plus data-icon="inline-start" aria-hidden />
        Ajoute Kosyon
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nouvo Kosyon</SheetTitle>
          <SheetDescription>Anrejistre yon kosyon resevwa pou yon boutik.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4 px-4 pb-4">
          <FieldGroup>
            <Field data-invalid={!!errors.storeId || undefined}>
              <FieldLabel htmlFor="storeId">Boutik</FieldLabel>
              <select
                id="storeId"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                {...register("storeId")}
              >
                <option value="">Chwazi yon boutik</option>
                {storeOptions.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <FieldError errors={[errors.storeId]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="deviceId">Tablèt (opsyonèl)</FieldLabel>
              <select
                id="deviceId"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                {...register("deviceId")}
              >
                <option value="">Okenn</option>
                {deviceOptions.map((d) => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>
            </Field>
            <Field>
              <FieldLabel htmlFor="contractNumber">Nimewo Kontra</FieldLabel>
              <Input id="contractNumber" {...register("contractNumber")} />
            </Field>
            <Field data-invalid={!!errors.amountHtg || undefined}>
              <FieldLabel htmlFor="amountHtg">Montan Kosyon (HTG)</FieldLabel>
              <Input id="amountHtg" type="number" step="0.01" {...register("amountHtg")} />
              <FieldError errors={[errors.amountHtg]} />
            </Field>
            <Field data-invalid={!!errors.receivedDate || undefined}>
              <FieldLabel htmlFor="receivedDate">Dat Resevwa</FieldLabel>
              <Input id="receivedDate" type="date" {...register("receivedDate")} />
              <FieldError errors={[errors.receivedDate]} />
            </Field>
          </FieldGroup>

          {formError && (
            <p role="alert" className="text-sm font-medium text-danger">
              {formError}
            </p>
          )}

          <SheetFooter className="px-0">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden />}
              Anrejistre Kosyon
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export function DepositsClient({
  deposits,
  storeOptions,
  deviceOptions,
}: {
  deposits: Deposit[];
  storeOptions: { id: string; name: string }[];
  deviceOptions: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Deposit | null>(null);
  const [pendingStatus, setPendingStatus] = useState<DepositStatus | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSaveStatus() {
    if (!selected || !pendingStatus) return;
    setSaving(true);
    try {
      await updateDepositStatus(selected.id, pendingStatus);
      toast.success("Estati kosyon mete ajou.");
      setSelected(null);
      setPendingStatus(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Yon erè fèt.");
    } finally {
      setSaving(false);
    }
  }

  const columns: AdminColumn<Deposit>[] = [
    { id: "store", header: "Boutik", csvValue: (r) => r.storeName, cell: (r) => <span className="font-medium">{r.storeName}</span> },
    { id: "contract", header: "Kontra", csvValue: (r) => r.contractNumber, cell: (r) => r.contractNumber },
    { id: "device", header: "Tablèt", csvValue: (r) => r.deviceId, cell: (r) => r.deviceId },
    { id: "amount", header: "Montan Kosyon", csvValue: (r) => r.amountHtg, cell: (r) => formatCurrencyHTG(r.amountHtg) },
    { id: "received", header: "Dat Resevwa", csvValue: (r) => r.receivedDate, cell: (r) => formatDateTime(r.receivedDate) },
    { id: "status", header: "Estati", csvValue: (r) => DEPOSIT_STATUS_LABELS[r.status].label, cell: (r) => <StatusBadge {...DEPOSIT_STATUS_LABELS[r.status]} /> },
    { id: "return", header: "Montan pou Rann", csvValue: (r) => r.amountToReturnHtg ?? "—", cell: (r) => (r.amountToReturnHtg != null ? formatCurrencyHTG(r.amountToReturnHtg) : "—") },
    { id: "process", header: "Pwosesis", cell: (r) => (
      <Button type="button" variant="outline" size="sm" onClick={() => { setSelected(r); setPendingStatus(r.status); }}>
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
        actions={<AddDepositSheet storeOptions={storeOptions} deviceOptions={deviceOptions} />}
      />

      <AdminDataTable
        data={deposits}
        columns={columns}
        filters={FILTERS}
        searchPlaceholder="Chèche pa non boutik oswa nimewo kontra..."
        searchPredicate={(row, q) => row.storeName.toLowerCase().includes(q) || row.contractNumber.toLowerCase().includes(q)}
        getRowKey={(row) => row.id}
        exportFilename="kosyon.csv"
        emptyTitle="Pa gen kosyon ki matche"
        emptyDescription="Ajoute premye kosyon ak bouton 'Ajoute Kosyon' anwo a."
      />

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Pwosesis Kosyon — {selected?.storeName}</SheetTitle>
            <SheetDescription>
              Kontra {selected?.contractNumber} · Tablèt {selected?.deviceId}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 px-4 pb-4">
            <Field>
              <FieldLabel htmlFor="depositStatus">Estati</FieldLabel>
              <Select value={pendingStatus ?? undefined} onValueChange={(v) => v && setPendingStatus(v as DepositStatus)}>
                <SelectTrigger id="depositStatus" className="w-full">
                  <SelectValue>{(value: string) => DEPOSIT_STATUS_LABELS[value as DepositStatus].label}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Button type="button" size="sm" disabled={saving || pendingStatus === selected?.status} onClick={handleSaveStatus}>
              {saving && <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden />}
              Anrejistre Estati
            </Button>

            <div className="flex flex-col gap-3 border-t border-border pt-4">
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
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
