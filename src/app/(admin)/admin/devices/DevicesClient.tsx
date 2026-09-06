"use client";

import { useRef, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, LoaderCircle, PackageCheck, Plus, Wrench, AlertTriangle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, type AdminColumn, type AdminFilter } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";
import { useAdminActor } from "@/components/admin/AdminSessionProvider";
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
} from "@/lib/admin/mutations/devices";
import { uploadDevicePhoto } from "@/lib/storage/uploadDevicePhoto";
import { deviceBatchSchema, type DeviceBatchFormInput, type DeviceBatchFormOutput } from "@/lib/validations/device";
import { formatCurrencyHTG } from "@/lib/format";
import type { AdminDevice, DeviceStatusAdmin } from "@/types/admin";

type ActionKind = "mark_ready" | "reserve" | "repair" | "lost";

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
  repair: {
    title: "Anrejistre yon reparasyon",
    description: "Tablèt la ap pase an estati 'An reparasyon'.",
    confirmLabel: "Konfime",
    auditAction: "device.repair_logged",
    successMessage: "Reparasyon anrejistre.",
    mutate: logDeviceRepair,
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
};

function AddDevicesSheet() {
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
      <SheetTrigger render={<Button type="button" />}>
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
  onDone,
}: {
  device: AdminDevice;
  storeOptions: { id: string; name: string }[];
  onDone: () => void;
}) {
  const actor = useAdminActor();
  const [open, setOpen] = useState(false);
  const [storeId, setStoreId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleAssign() {
    if (!storeId) return;
    setSubmitting(true);
    try {
      await assignDeviceToStore(device.dbId, storeId);
      await recordAuditEvent({
        actorId: actor.id,
        actorRole: actor.role,
        action: "device.assigned",
        resourceType: "device",
        resourceId: device.id,
        storeId,
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
      <DialogTrigger render={<Button type="button" variant="outline" size="sm" />}>
        Asiyen a yon boutik
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asiyen {device.id}</DialogTitle>
          <DialogDescription>Chwazi boutik ki pral resevwa tablèt sa a — li ap pase an estati &quot;Deplwaye (Aktif)&quot;.</DialogDescription>
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
          <Button type="button" disabled={!storeId || submitting} onClick={handleAssign}>
            {submitting && <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden />}
            Konfime Asiyasyon
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DevicesContent({ devices, storeOptions }: { devices: AdminDevice[]; storeOptions: { id: string; name: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawStatus = searchParams.get("status");
  const initialStatus = rawStatus === "deployed" ? "deployed_active" : rawStatus;
  const [pending, setPending] = useState<{ device: AdminDevice; kind: ActionKind } | null>(null);

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
        <AssignDeviceDialog device={r} storeOptions={storeOptions} onDone={() => router.refresh()} />
      )
    ) },
    { id: "cost", header: "Kou Reyèl", csvValue: (r) => r.actualCostHtg, cell: (r) => formatCurrencyHTG(r.actualCostHtg) },
    { id: "purchase", header: "Dat Achte", csvValue: (r) => r.purchaseDate, cell: (r) => r.purchaseDate || "—" },
    { id: "repairs", header: "Reparasyon", csvValue: (r) => r.repairHistory.length, cell: (r) => (r.repairHistory.length > 0 ? `${r.repairHistory.length}` : "—") },
    { id: "actions", header: "Aksyon", cell: (r) => (
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
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
          <DropdownMenuItem onClick={() => setPending({ device: r, kind: "repair" })}>
            <Wrench data-icon="inline-start" aria-hidden />
            Anrejistre reparasyon
          </DropdownMenuItem>
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
        actions={<AddDevicesSheet />}
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
    </div>
  );
}

export function DevicesClient({
  devices,
  storeOptions,
}: {
  devices: AdminDevice[];
  storeOptions: { id: string; name: string }[];
}) {
  return (
    <Suspense>
      <DevicesContent devices={devices} storeOptions={storeOptions} />
    </Suspense>
  );
}
