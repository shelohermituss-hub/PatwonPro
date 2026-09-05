"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, type AdminColumn, type AdminFilter } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { leadSchema, type LeadFormInput, type LeadFormOutput } from "@/lib/validations/lead";
import { createLead, updateLeadStage, convertLeadToStore } from "@/lib/admin/mutations/leads";
import { LEAD_STAGE_LABELS } from "@/lib/admin/labels";
import { formatDateTime } from "@/lib/format";
import type { Lead, LeadStage } from "@/types/admin";

const STAGE_OPTIONS = Object.entries(LEAD_STAGE_LABELS).map(([value, meta]) => ({ value, label: meta.label }));

function AddLeadSheet() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormInput, unknown, LeadFormOutput>({
    resolver: zodResolver(leadSchema),
    defaultValues: { storeName: "", ownerName: "", usesMobileMoney: false },
  });

  async function onSubmit(values: LeadFormOutput) {
    setFormError(null);
    try {
      await createLead(values);
      toast.success("Lead ajoute.");
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
        Ajoute Lead
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nouvo Lead</SheetTitle>
          <SheetDescription>Antre enfòmasyon boutik prospè a.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4 px-4 pb-4">
          <FieldGroup>
            <Field data-invalid={!!errors.storeName || undefined}>
              <FieldLabel htmlFor="storeName">Non Boutik</FieldLabel>
              <Input id="storeName" {...register("storeName")} />
              <FieldError errors={[errors.storeName]} />
            </Field>
            <Field data-invalid={!!errors.ownerName || undefined}>
              <FieldLabel htmlFor="ownerName">Non Pwopriyetè</FieldLabel>
              <Input id="ownerName" {...register("ownerName")} />
              <FieldError errors={[errors.ownerName]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="phone">Telefòn</FieldLabel>
              <Input id="phone" {...register("phone")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="whatsapp">WhatsApp</FieldLabel>
              <Input id="whatsapp" {...register("whatsapp")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="address">Adrès</FieldLabel>
              <Input id="address" {...register("address")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="zone">Zòn</FieldLabel>
              <Input id="zone" {...register("zone")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="businessType">Tip Komès</FieldLabel>
              <Input id="businessType" {...register("businessType")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="estimatedProductCount">Kantite Pwodwi Estime</FieldLabel>
              <Input id="estimatedProductCount" type="number" {...register("estimatedProductCount")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="sellerCount">Kantite Vandè</FieldLabel>
              <Input id="sellerCount" type="number" {...register("sellerCount")} />
            </Field>
            <Field orientation="horizontal">
              <Checkbox id="usesMobileMoney" {...register("usesMobileMoney")} />
              <FieldLabel htmlFor="usesMobileMoney">Sèvi ak MonCash/NatCash deja</FieldLabel>
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
              Ajoute Lead
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function ConvertDialog({ lead, storeOptions, onDone }: { lead: Lead; storeOptions: { id: string; name: string }[]; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [storeId, setStoreId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleConvert() {
    if (!storeId) return;
    setSubmitting(true);
    try {
      await convertLeadToStore(lead.id, storeId);
      toast.success(`${lead.storeName} konvèti.`);
      setOpen(false);
      onDone();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Yon erè fèt.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant="outline" size="sm" />}>
        Konvèti
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Konvèti {lead.storeName}</DialogTitle>
          <DialogDescription>Chwazi vrè boutik ki koresponn (kreye deja pa pwopriyetè a nan /register).</DialogDescription>
        </DialogHeader>
        <Select value={storeId} onValueChange={(v) => setStoreId(v ?? "")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chwazi yon boutik">
              {(value: string) => storeOptions.find((s) => s.id === value)?.name ?? "Chwazi yon boutik"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {storeOptions.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button type="button" disabled={!storeId || submitting} onClick={handleConvert}>
            {submitting && <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden />}
            Konfime Konvèsyon
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function LeadsClient({ leads, storeOptions }: { leads: Lead[]; storeOptions: { id: string; name: string }[] }) {
  const router = useRouter();
  const AGENT_OPTIONS = Array.from(new Set(leads.map((l) => l.agentName))).map((a) => ({ value: a, label: a }));

  const FILTERS: AdminFilter<Lead>[] = [
    { id: "stage", label: "Etap", options: STAGE_OPTIONS, predicate: (row, v) => row.stage === (v as LeadStage) },
    ...(AGENT_OPTIONS.length ? [{ id: "agent", label: "Ajan", options: AGENT_OPTIONS, predicate: (row: Lead, v: string) => row.agentName === v }] : []),
  ];

  async function handleStageChange(lead: Lead, stage: LeadStage) {
    try {
      await updateLeadStage(lead.id, stage);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Yon erè fèt.");
    }
  }

  const columns: AdminColumn<Lead>[] = [
    { id: "store", header: "Boutik", csvValue: (r) => r.storeName, cell: (r) => (
      <div className="flex flex-col">
        <span className="font-medium text-foreground">{r.storeName}</span>
        <span className="text-xs text-text-secondary">{r.ownerName}</span>
      </div>
    ) },
    { id: "contact", header: "Kontak", csvValue: (r) => r.phone, cell: (r) => r.phone },
    { id: "zone", header: "Zòn", csvValue: (r) => r.zone, cell: (r) => r.zone },
    { id: "type", header: "Tip Komès", csvValue: (r) => r.businessType, cell: (r) => r.businessType },
    { id: "stage", header: "Etap Pipeline", csvValue: (r) => LEAD_STAGE_LABELS[r.stage].label, cell: (r) => (
      <Select value={r.stage} onValueChange={(v) => v && handleStageChange(r, v as LeadStage)}>
        <SelectTrigger className="w-[190px]">
          <SelectValue>{(value: string) => LEAD_STAGE_LABELS[value as LeadStage].label}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {STAGE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    ) },
    { id: "agent", header: "Ajan", csvValue: (r) => r.agentName, cell: (r) => r.agentName },
    { id: "lastInteraction", header: "Dènye Kontak", csvValue: (r) => r.lastInteractionAt, cell: (r) => formatDateTime(r.lastInteractionAt) },
    { id: "actions", header: "Aksyon", cell: (r) => (
      r.stage !== "converted" && r.stage !== "lost" ? (
        <ConvertDialog lead={r} storeOptions={storeOptions} onDone={() => router.refresh()} />
      ) : (
        <StatusBadge {...LEAD_STAGE_LABELS[r.stage]} />
      )
    ) },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <AdminPageHeader
        title="Lead"
        description="Pipeline konplè: Lead → Kontakte → Demo → Esè → Konvèti/Pèdi."
        actions={<AddLeadSheet />}
      />

      <AdminDataTable
        data={leads}
        columns={columns}
        filters={FILTERS}
        searchPlaceholder="Chèche pa non boutik oswa pwopriyetè..."
        searchPredicate={(row, q) => row.storeName.toLowerCase().includes(q) || row.ownerName.toLowerCase().includes(q)}
        getRowKey={(row) => row.id}
        exportFilename="lead.csv"
        emptyTitle="Pa gen lead ki matche"
        emptyDescription="Ajoute premye lead ou avèk bouton 'Ajoute Lead' anwo a."
      />
    </div>
  );
}
