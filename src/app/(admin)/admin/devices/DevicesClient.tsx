"use client";

import { useRef, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, LoaderCircle, PackageCheck, Plus, Wrench, AlertTriangle, RotateCcw, PackageMinus, Check, X } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, type AdminColumn, type AdminFilter } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";
import { useAdminActor } from "@/components/admin/AdminSessionProvider";
import { can } from "@/lib/admin/permissions";
import { recordAuditEvent } from "@/lib/admin/auditLog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DEVICE_STATUS_LABELS } from "@/lib/admin/labels";
import {
  markDeviceReady,
  reserveDevice,
  logDeviceRepair,
  reportDeviceLost,
  createDeviceBatch,
  assignDeviceToStore,
  unassignDeviceFromStore,
} from "@/lib/admin/mutations/devices";
import { resolveReplacementRequest } from "@/lib/admin/mutations/replacementRequests";
import { uploadDevicePhoto } from "@/lib/storage/uploadDevicePhoto";
import { deviceBatchSchema, type DeviceBatchFormInput, type DeviceBatchFormOutput } from "@/lib/validations/device";
import { formatCurrencyHTG, formatDateTime } from "@/lib/format";
import type { AdminDevice, AdminReplacementRequest, DeviceStatusAdmin } from "@/types/admin";

type ActionKind = "mark_ready" | "reserve" | "lost" | "unassign";

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
  lost: {
    title: "Siyale vòl oswa pèt",
    description: "Aksyon sa a make tablèt la kòm pèdi de fason pèmanan nan envantè a.",
    confirmLabel: "Siyale Pèdi",
    destructive: true,
    auditAction: "device.reported_lost",
    successMessage: "Tablèt make pèdi.",
    mutate: reportDeviceLost,
  },
  unassign: {
    title: "Dezasiyen tablèt la",
    description: "Tablèt la ap tounen nan estòk (\"Disponib\") e li p ap plis lye ak boutik la. Sa a pa afekte kosyon ki deja gen pou tablèt sa a — jere ranbousman an separeman sou paj Kosyon yo.",
    confirmLabel: "Dezasiyen",
    destructive: true,
    auditAction: "device.unassigned",
    successMessage: "Tablèt dezasiyen, li tounen nan estòk.",
    mutate: unassignDeviceFromStore,
  },
};

function AddDevicesSheet({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const actor = useAdminActor();
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DeviceBatchFormInput, unknown, DeviceBatchFormOutput>({
    resolver: zodResolver(deviceBatchSchema),
    defaultValues: { brand: "", model: "", quantity: 1, importBatch: "", purchaseDate: "" },
  });

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function resetForm() {
    reset();
    setPhotoFile(null);
    setPhotoPreview(null);
  }

  async function onSubmit(values: DeviceBatchFormOutput) {
    setFormError(null);
    try {
      let modelPhotoUrl: string | null = null;
      if (photoFile) {
        const { publicUrl, error } = await uploadDevicePhoto(photoFile);
        if (error || !publicUrl) throw new Error(error ?? "Nou pa t ka voye foto a.");
        modelPhotoUrl = publicUrl;
      }

      await createDeviceBatch({ ...values, modelPhotoUrl });
      await recordAuditEvent({
        actorId: actor.id,
        actorRole: actor.role,
        action: "device.batch_created",
        resourceType: "device",
        resourceId: `${values.brand} ${values.model}`,
        metadata: { quantity: values.quantity },
      });

      toast.success(`${values.quantity} tablèt ajoute nan estòk la.`);
      resetForm();
      setOpen(false);
      router.refresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Yon erè fèt.");
    }
  }

  return (
    <Sheet open={open} onOpenChange={(next) => { setOpen(next); if (!next) resetForm(); }}>
      <SheetTrigger render={<Button type="button" disabled={disabled} />}>
        <Plus data-icon="inline-start" aria-hidden />
        Ajoute Tablèt
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nouvo Modèl Tablèt</SheetTitle>
          <SheetDescription>
            Antre enfòmasyon modèl la ansanm ak kantite ou genyen — chak inite ap antre nan
            estòk kòm yon tablèt separe, pare pou asiyen a yon boutik.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4 px-4 pb-4">
          <div className="flex items-center gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted">
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element -- local blob preview, not a next.config image domain.
                <img src={photoPreview} alt="" className="size-full object-cover" />
              ) : (
                <span className="px-1 text-center text-[10px] text-text-secondary">Pa gen foto</span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                Chwazi Foto
              </Button>
              <p className="text-xs text-text-secondary">JPEG, PNG oswa WebP · 3 Mo maks (opsyonèl)</p>
            </div>
          </div>

          <FieldGroup>
            <Field data-invalid={!!errors.brand || undefined}>
              <FieldLabel htmlFor="brand">Mak</FieldLabel>
              <Input id="brand" placeholder="Ex: Samsung" {...register("brand")} />
              <FieldError errors={[errors.brand]} />
            </Field>
            <Field data-invalid={!!errors.model || undefined}>
              <FieldLabel htmlFor="model">Modèl</FieldLabel>
              <Input id="model" placeholder="Ex: Galaxy Tab A9" {...register("model")} />
              <FieldError errors={[errors.model]} />
            </Field>
            <Field data-invalid={!!errors.quantity || undefined}>
              <FieldLabel htmlFor="quantity">Kantite Disponib</FieldLabel>
              <Input id="quantity" type="number" min={1} max={500} {...register("quantity")} />
              <FieldError errors={[errors.quantity]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="actualCostHtg">Kou Reyèl pa Inite (HTG)</FieldLabel>
              <Input id="actualCostHtg" type="number" min={0} step="0.01" {...register("actualCostHtg")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="purchaseDate">Dat Achte</FieldLabel>
              <Input id="purchaseDate" type="date" {...register("purchaseDate")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="importBatch">Lo Enpòtasyon</FieldLabel>
              <Input id="importBatch" placeholder="Ex: LOT-2026-03" {...register("importBatch")} />
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
              Ajoute nan Estòk
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function AssignDeviceDialog({
  device,
  storeOptions,
  disabled,
  defaultDepositAmountHtg,
  onDone,
}: {
  device: AdminDevice;
  storeOptions: { id: string; name: string }[];
  disabled: boolean;
  defaultDepositAmountHtg: number;
  onDone: () => void;
}) {
  const actor = useAdminActor();
  const [open, setOpen] = useState(false);
  const [storeId, setStoreId] = useState("");
  const [depositAmount, setDepositAmount] = useState(String(defaultDepositAmountHtg));
  const [paymentMode, setPaymentMode] = useState<"lump_sum" | "monthly_installment">("lump_sum");
  const [monthlyAmount, setMonthlyAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const depositAmountHtg = Number(depositAmount) || 0;
  const monthlyInstallmentHtg = Number(monthlyAmount) || 0;
  const canSubmit =
    !!storeId &&
    depositAmountHtg > 0 &&
    (paymentMode === "lump_sum" || monthlyInstallmentHtg > 0);

  async function handleAssign() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await assignDeviceToStore(device.dbId, storeId, {
        amountHtg: depositAmountHtg,
        paymentMode,
        monthlyInstallmentHtg: paymentMode === "monthly_installment" ? monthlyInstallmentHtg : null,
      });
      await recordAuditEvent({
        actorId: actor.id,
        actorRole: actor.role,
        action: "device.assigned",
        resourceType: "device",
        resourceId: device.id,
        storeId,
        metadata: { depositAmountHtg, paymentMode, monthlyInstallmentHtg: paymentMode === "monthly_installment" ? monthlyInstallmentHtg : null },
      });
      toast.success(`${device.id} asiyen.`);
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
      <DialogTrigger render={<Button type="button" variant="outline" size="sm" disabled={disabled} />}>
        Asiyen a yon boutik
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asiyen {device.id}</DialogTitle>
          <DialogDescription>Chwazi boutik ki pral resevwa tablèt sa a — li ap pase an estati &quot;Deplwaye (Aktif)&quot;, epi yon kosyon ap kreye pou kòmèsan an peye.</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="assign-store">Boutik</FieldLabel>
            <Select value={storeId} onValueChange={(v) => setStoreId(v ?? "")}>
              <SelectTrigger id="assign-store" className="w-full">
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
          </Field>

          <Field>
            <FieldLabel htmlFor="assign-deposit-amount">Montan kosyon total (HTG)</FieldLabel>
            <Input
              id="assign-deposit-amount"
              type="number"
              min={0}
              step="1"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="assign-payment-mode">Fason peye kosyon</FieldLabel>
            <Select value={paymentMode} onValueChange={(v) => setPaymentMode((v as typeof paymentMode) ?? "lump_sum")}>
              <SelectTrigger id="assign-payment-mode" className="w-full">
                <SelectValue>
                  {(value: typeof paymentMode) =>
                    value === "lump_sum" ? "Yon sèl fwa (nan enstalasyon)" : "Mansyalite fiks chak mwa"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="lump_sum">Yon sèl fwa (nan enstalasyon)</SelectItem>
                  <SelectItem value="monthly_installment">Mansyalite fiks chak mwa</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          {paymentMode === "monthly_installment" && (
            <Field>
              <FieldLabel htmlFor="assign-monthly-amount">Montan mansyèl (HTG)</FieldLabel>
              <Input
                id="assign-monthly-amount"
                type="number"
                min={0}
                step="1"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(e.target.value)}
              />
            </Field>
          )}
        </FieldGroup>
        <DialogFooter>
          <Button type="button" disabled={!canSubmit || submitting} onClick={handleAssign}>
            {submitting && <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden />}
            Konfime Asiyasyon
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RepairDeviceDialog({
  device,
  onOpenChange,
  onDone,
}: {
  device: AdminDevice | null;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}) {
  const actor = useAdminActor();
  const [issue, setIssue] = useState("");
  const [cost, setCost] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    if (!device || !issue.trim()) return;
    setSubmitting(true);
    try {
      await logDeviceRepair(device.dbId, { issue: issue.trim(), cost: Number(cost) || 0 });
      await recordAuditEvent({
        actorId: actor.id,
        actorRole: actor.role,
        action: "device.repair_logged",
        resourceType: "device",
        resourceId: device.id,
        storeId: device.assignedStoreId,
        metadata: { issue: issue.trim(), cost: Number(cost) || 0 },
      });
      toast.success("Reparasyon anrejistre.");
      setIssue("");
      setCost("");
      onOpenChange(false);
      onDone();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Yon erè fèt.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={!!device} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Anrejistre yon reparasyon — {device?.id}</DialogTitle>
          <DialogDescription>Tablèt la ap pase an estati &quot;An reparasyon&quot;.</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field data-invalid={!issue.trim() || undefined}>
            <FieldLabel htmlFor="repairIssue">Pwoblèm</FieldLabel>
            <Input id="repairIssue" value={issue} onChange={(e) => setIssue(e.target.value)} placeholder="Ex: Ekran fele" />
          </Field>
          <Field>
            <FieldLabel htmlFor="repairCost">Kou Reparasyon (HTG)</FieldLabel>
            <Input id="repairCost" type="number" min={0} step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button type="button" disabled={!issue.trim() || submitting} onClick={handleConfirm}>
            {submitting && <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden />}
            Konfime
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ResolveReplacementDialog({
  request,
  action,
  onOpenChange,
  onDone,
}: {
  request: AdminReplacementRequest | null;
  action: "approved" | "rejected" | null;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}) {
  const actor = useAdminActor();
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    if (!request || !action) return;
    setSubmitting(true);
    try {
      await resolveReplacementRequest(request.id, {
        status: action,
        resolutionNote: note.trim() || null,
        resolvedBy: actor.id,
      });
      await recordAuditEvent({
        actorId: actor.id,
        actorRole: actor.role,
        action: action === "approved" ? "replacement_request.approved" : "replacement_request.rejected",
        resourceType: "replacement_request",
        resourceId: request.id,
        storeId: request.storeId,
        metadata: { deviceCode: request.deviceCode, note: note.trim() || null },
      });
      toast.success(action === "approved" ? "Demand apwouve." : "Demand rejte.");
      setNote("");
      onOpenChange(false);
      onDone();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Yon erè fèt.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={!!request && !!action} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {action === "approved" ? "Apwouve" : "Rejte"} demand ranplasman — {request?.deviceCode}
          </DialogTitle>
          <DialogDescription>
            {action === "approved"
              ? "Apre apwouve, asiyen yon nouvo tablèt bay boutik la atravè aksyon \"Asiyen a yon boutik\" nòmal la."
              : "Boutik la ap wè demand lan make rejte."}
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="resolution-note">Nòt (opsyonèl)</FieldLabel>
            <Input id="resolution-note" value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button type="button" disabled={submitting} onClick={handleConfirm}>
            {submitting && <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden />}
            Konfime
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DevicesContent({
  devices,
  storeOptions,
  defaultDepositAmountHtg,
  replacementRequests,
}: {
  devices: AdminDevice[];
  storeOptions: { id: string; name: string }[];
  defaultDepositAmountHtg: number;
  replacementRequests: AdminReplacementRequest[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const actor = useAdminActor();
  const readOnly = !can(actor.role, "manage_devices");
  const rawStatus = searchParams.get("status");
  const initialStatus = rawStatus === "deployed" ? "deployed_active" : rawStatus;
  const [pending, setPending] = useState<{ device: AdminDevice; kind: ActionKind } | null>(null);
  const [repairTarget, setRepairTarget] = useState<AdminDevice | null>(null);
  const [replacementResolve, setReplacementResolve] = useState<{
    request: AdminReplacementRequest;
    action: "approved" | "rejected";
  } | null>(null);

  const STATUS_OPTIONS = Object.entries(DEVICE_STATUS_LABELS).map(([value, meta]) => ({ value, label: meta.label }));
  const BRAND_OPTIONS = Array.from(new Set(devices.map((d) => d.brand))).map((b) => ({ value: b, label: b }));

  const FILTERS: AdminFilter<AdminDevice>[] = [
    { id: "status", label: "Estati", options: STATUS_OPTIONS, predicate: (row, v) => row.status === (v as DeviceStatusAdmin) },
    { id: "brand", label: "Mak", options: BRAND_OPTIONS, predicate: (row, v) => row.brand === v },
  ];

  const columns: AdminColumn<AdminDevice>[] = [
    { id: "photo", header: "Foto", cell: (r) => (
      <div className="flex size-10 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
        {r.modelPhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage URLs aren't in next.config's image domains.
          <img src={r.modelPhotoUrl} alt="" className="size-full object-cover" />
        ) : (
          <span className="text-[9px] text-text-secondary">—</span>
        )}
      </div>
    ) },
    { id: "id", header: "Device ID", csvValue: (r) => r.id, cell: (r) => <span className="font-medium">{r.id}</span> },
    { id: "brand", header: "Mak / Modèl", csvValue: (r) => `${r.brand} ${r.model}`, cell: (r) => `${r.brand} ${r.model}` },
    { id: "status", header: "Estati", csvValue: (r) => DEVICE_STATUS_LABELS[r.status].label, cell: (r) => <StatusBadge {...DEVICE_STATUS_LABELS[r.status]} /> },
    { id: "store", header: "Boutik Asiyen", csvValue: (r) => r.assignedStoreName ?? "—", cell: (r) => (
      r.assignedStoreName ?? (
        <AssignDeviceDialog
          device={r}
          storeOptions={storeOptions}
          disabled={readOnly}
          defaultDepositAmountHtg={defaultDepositAmountHtg}
          onDone={() => router.refresh()}
        />
      )
    ) },
    { id: "cost", header: "Kou Reyèl", csvValue: (r) => r.actualCostHtg, cell: (r) => formatCurrencyHTG(r.actualCostHtg) },
    { id: "purchase", header: "Dat Achte", csvValue: (r) => r.purchaseDate, cell: (r) => r.purchaseDate || "—" },
    { id: "repairs", header: "Reparasyon", csvValue: (r) => r.repairHistory.length, cell: (r) => (r.repairHistory.length > 0 ? `${r.repairHistory.length}` : "—") },
    { id: "actions", header: "Aksyon", cell: (r) => (
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="sm" disabled={readOnly} />}>
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
          <DropdownMenuItem onClick={() => setRepairTarget(r)}>
            <Wrench data-icon="inline-start" aria-hidden />
            Anrejistre reparasyon
          </DropdownMenuItem>
          {r.assignedStoreId && (
            <DropdownMenuItem onClick={() => setPending({ device: r, kind: "unassign" })} variant="destructive">
              <PackageMinus data-icon="inline-start" aria-hidden />
              Dezasiyen
            </DropdownMenuItem>
          )}
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
      <AdminPageHeader
        title="Aparèy"
        description="Pak tablèt yo — enstalasyon, rezèv, reparasyon, ak pèt."
        actions={<AddDevicesSheet disabled={readOnly} />}
      />

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

      <RepairDeviceDialog
        device={repairTarget}
        onOpenChange={(open) => !open && setRepairTarget(null)}
        onDone={() => { setRepairTarget(null); router.refresh(); }}
      />

      {replacementRequests.length > 0 && (
        <div className="flex flex-col gap-3">
          <AdminPageHeader
            title="Demand Ranplasman"
            description="Demand kòmèsan yo fè pou yon tablèt defektye — an atant desizyon."
          />
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-text-secondary">
                  <th className="p-3 font-medium">Tablèt</th>
                  <th className="p-3 font-medium">Boutik</th>
                  <th className="p-3 font-medium">Rezon</th>
                  <th className="p-3 font-medium">Dat</th>
                  <th className="p-3 font-medium">Aksyon</th>
                </tr>
              </thead>
              <tbody>
                {replacementRequests.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className="p-3 font-medium">{r.deviceCode}</td>
                    <td className="p-3">{r.storeName}</td>
                    <td className="max-w-xs p-3 text-text-secondary">{r.reason}</td>
                    <td className="p-3 text-text-secondary">{formatDateTime(r.createdAt)}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          disabled={readOnly}
                          onClick={() => setReplacementResolve({ request: r, action: "approved" })}
                        >
                          <Check data-icon="inline-start" aria-hidden />
                          Apwouve
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={readOnly}
                          onClick={() => setReplacementResolve({ request: r, action: "rejected" })}
                        >
                          <X data-icon="inline-start" aria-hidden />
                          Rejte
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ResolveReplacementDialog
        request={replacementResolve?.request ?? null}
        action={replacementResolve?.action ?? null}
        onOpenChange={(open) => !open && setReplacementResolve(null)}
        onDone={() => { setReplacementResolve(null); router.refresh(); }}
      />
    </div>
  );
}

export function DevicesClient({
  devices,
  storeOptions,
  defaultDepositAmountHtg,
  replacementRequests,
}: {
  devices: AdminDevice[];
  storeOptions: { id: string; name: string }[];
  defaultDepositAmountHtg: number;
  replacementRequests: AdminReplacementRequest[];
}) {
  return (
    <Suspense>
      <DevicesContent
        devices={devices}
        storeOptions={storeOptions}
        defaultDepositAmountHtg={defaultDepositAmountHtg}
        replacementRequests={replacementRequests}
      />
    </Suspense>
  );
}
