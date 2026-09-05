"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Circle, LoaderCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, type AdminColumn, type AdminFilter } from "@/components/admin/AdminDataTable";
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
import { installationSchema, type InstallationFormInput, type InstallationFormOutput } from "@/lib/validations/installation";
import { createInstallation, updateInstallationChecklist, updateInstallationStatus } from "@/lib/admin/mutations/installations";
import { INSTALLATION_STATUS_LABELS } from "@/lib/admin/labels";
import { formatDateTime } from "@/lib/format";
import type { Installation, InstallationStatus } from "@/types/admin";

const STATUS_OPTIONS = Object.entries(INSTALLATION_STATUS_LABELS).map(([value, meta]) => ({ value, label: meta.label }));

const FILTERS: AdminFilter<Installation>[] = [
  { id: "status", label: "Estati", options: STATUS_OPTIONS, predicate: (row, v) => row.status === (v as InstallationStatus) },
];

function AddInstallationSheet({
  agentOptions,
  deviceOptions,
}: {
  agentOptions: { id: string; name: string }[];
  deviceOptions: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InstallationFormInput, unknown, InstallationFormOutput>({
    resolver: zodResolver(installationSchema),
    defaultValues: { storeName: "" },
  });

  async function onSubmit(values: InstallationFormOutput) {
    setFormError(null);
    try {
      await createInstallation(values);
      toast.success("Enstalasyon planifye.");
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
        Planifye Enstalasyon
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nouvo Enstalasyon</SheetTitle>
          <SheetDescription>Planifye yon vizit teren pou yon boutik.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4 px-4 pb-4">
          <FieldGroup>
            <Field data-invalid={!!errors.storeName || undefined}>
              <FieldLabel htmlFor="storeName">Non Boutik</FieldLabel>
              <Input id="storeName" {...register("storeName")} />
              <FieldError errors={[errors.storeName]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="contact">Kontak</FieldLabel>
              <Input id="contact" {...register("contact")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="address">Adrès</FieldLabel>
              <Input id="address" {...register("address")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="scheduledAt">Dat/Lè Planifye</FieldLabel>
              <Input id="scheduledAt" type="datetime-local" {...register("scheduledAt")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="agentId">Ajan</FieldLabel>
              <select
                id="agentId"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                {...register("agentId")}
              >
                <option value="">Pa asiyen</option>
                {agentOptions.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </Field>
            <Field>
              <FieldLabel htmlFor="deviceId">Tablèt</FieldLabel>
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
          </FieldGroup>

          {formError && (
            <p role="alert" className="text-sm font-medium text-danger">
              {formError}
            </p>
          )}

          <SheetFooter className="px-0">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden />}
              Planifye
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export function InstallationsClient({
  installations,
  agentOptions,
  deviceOptions,
}: {
  installations: Installation[];
  agentOptions: { id: string; name: string }[];
  deviceOptions: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Installation | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  async function handleStatusChange(installation: Installation, status: InstallationStatus) {
    try {
      await updateInstallationStatus(installation.id, status);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Yon erè fèt.");
    }
  }

  async function handleToggleChecklistItem(label: string) {
    if (!selected) return;
    setToggling(label);
    const updated = selected.checklist.map((item) =>
      item.label === label ? { ...item, done: !item.done } : item,
    );
    try {
      await updateInstallationChecklist(selected.id, updated);
      setSelected({ ...selected, checklist: updated });
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Yon erè fèt.");
    } finally {
      setToggling(null);
    }
  }

  const columns: AdminColumn<Installation>[] = [
    { id: "store", header: "Boutik", csvValue: (r) => r.storeName, cell: (r) => <span className="font-medium">{r.storeName}</span> },
    { id: "contact", header: "Kontak", csvValue: (r) => r.contact, cell: (r) => r.contact },
    { id: "slot", header: "Kreno", csvValue: (r) => r.scheduledAt ?? "—", cell: (r) => (r.scheduledAt ? formatDateTime(r.scheduledAt) : "—") },
    { id: "agent", header: "Ajan", csvValue: (r) => r.agentName, cell: (r) => r.agentName },
    { id: "status", header: "Estati", csvValue: (r) => INSTALLATION_STATUS_LABELS[r.status].label, cell: (r) => (
      <Select value={r.status} onValueChange={(v) => v && handleStatusChange(r, v as InstallationStatus)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue>{(value: string) => INSTALLATION_STATUS_LABELS[value as InstallationStatus].label}</SelectValue>
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
    ) },
    { id: "next", header: "Pwochen Aksyon", csvValue: (r) => r.nextAction ?? "", cell: (r) => <span className="text-sm text-text-secondary">{r.nextAction ?? "—"}</span> },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <AdminPageHeader
        title="Enstalasyon Teren"
        description="Chak enstalasyon suiv menm chèklis pou evite erè."
        actions={<AddInstallationSheet agentOptions={agentOptions} deviceOptions={deviceOptions} />}
      />

      <AdminDataTable
        data={installations}
        columns={columns}
        filters={FILTERS}
        searchPlaceholder="Chèche pa non boutik..."
        searchPredicate={(row, q) => row.storeName.toLowerCase().includes(q)}
        getRowKey={(row) => row.id}
        onRowClick={(row) => setSelected(row)}
        exportFilename="enstalasyon.csv"
        emptyTitle="Pa gen enstalasyon planifye"
        emptyDescription="Planifye premye enstalasyon ak bouton anwo a."
      />

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Chèklis — {selected?.storeName}</SheetTitle>
            <SheetDescription>{selected?.address}</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-3 px-4 pb-4">
            {selected?.checklist.map((item) => (
              <button
                key={item.label}
                type="button"
                disabled={toggling === item.label}
                onClick={() => handleToggleChecklistItem(item.label)}
                className="flex items-center gap-2.5 text-left"
              >
                {item.done ? (
                  <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden />
                ) : (
                  <Circle className="size-4 shrink-0 text-border" aria-hidden />
                )}
                <span className={item.done ? "text-text-secondary line-through" : "text-foreground"}>{item.label}</span>
              </button>
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
