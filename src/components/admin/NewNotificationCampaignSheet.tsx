"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Plus, Search, X, Users, User, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel, FieldTitle, FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import {
  notificationCampaignSchema,
  toRecurringCronExpression,
  type NotificationCampaignFormInput,
  type NotificationCampaignFormOutput,
} from "@/lib/validations/notificationCampaign";
import { createNotificationCampaign } from "@/lib/admin/actions/notificationCampaigns";
import { NOTIFICATION_TEMPLATES } from "@/lib/admin/notificationTemplates";
import {
  NOTIFICATION_CAMPAIGN_TRIGGER_TYPE_LABELS,
  NOTIFICATION_CAMPAIGN_TYPE_LABELS,
} from "@/lib/admin/labels";
import type { UserOption } from "@/lib/admin/queries/notificationCampaigns";
import type { NotificationCampaignTargetScope, NotificationCampaignType } from "@/types/admin";

const TARGET_SCOPE_OPTIONS: { value: NotificationCampaignTargetScope; label: string; icon: typeof User }[] = [
  { value: "single_user", label: "Yon Sèl Itilizatè", icon: User },
  { value: "all_stores", label: "Tout Machann", icon: Users },
  { value: "admin_team", label: "Ekip Admin", icon: ShieldCheck },
];
const NOTIFICATION_TYPES: NotificationCampaignType[] = ["info", "success", "warning", "urgent"];
const TRIGGER_TYPES = ["immediate", "scheduled_once", "recurring"] as const;
const WEEKDAY_OPTIONS = [
  { value: "1", label: "Lendi" },
  { value: "2", label: "Madi" },
  { value: "3", label: "Mèkredi" },
  { value: "4", label: "Jedi" },
  { value: "5", label: "Vandredi" },
  { value: "6", label: "Samdi" },
  { value: "0", label: "Dimanch" },
];

const ROLE_LABELS: Record<UserOption["role"], string> = {
  owner: "Pwopriyetè",
  employee: "Anplwaye",
  platform_admin: "Admin",
};

function UserPicker({
  users,
  selectedId,
  onSelect,
}: {
  users: UserOption[];
  selectedId: string | undefined;
  onSelect: (id: string | undefined) => void;
}) {
  const [query, setQuery] = useState("");
  const selected = users.find((u) => u.id === selectedId);

  const filtered = useMemo(() => {
    if (!query.trim()) return users.slice(0, 20);
    const q = query.toLowerCase();
    return users.filter((u) => u.fullName.toLowerCase().includes(q)).slice(0, 20);
  }, [users, query]);

  if (selected) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted px-3 py-2.5">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">{selected.fullName}</span>
          <span className="text-xs text-text-secondary">
            {ROLE_LABELS[selected.role]}
            {selected.storeName ? ` · ${selected.storeName}` : ""}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={() => onSelect(undefined)}
          aria-label="Chanje itilizatè"
        >
          <X className="size-4" aria-hidden />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" aria-hidden />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechèche pa non..."
          className="min-h-11 pl-9"
        />
      </div>
      <div className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-md border border-border p-1">
        {filtered.length === 0 ? (
          <p className="p-3 text-center text-sm text-text-secondary">Pa gen rezilta.</p>
        ) : (
          filtered.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => onSelect(user.id)}
              className="flex flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left hover:bg-muted"
            >
              <span className="text-sm font-medium text-foreground">{user.fullName}</span>
              <span className="text-xs text-text-secondary">
                {ROLE_LABELS[user.role]}
                {user.storeName ? ` · ${user.storeName}` : ""}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export function NewNotificationCampaignSheet({ userOptions }: { userOptions: UserOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<NotificationCampaignFormInput, unknown, NotificationCampaignFormOutput>({
    resolver: zodResolver(notificationCampaignSchema),
    defaultValues: {
      targetScope: "all_stores",
      triggerType: "immediate",
      notificationType: "info",
      category: "admin_broadcast",
    },
  });

  const targetScope = useWatch({ control, name: "targetScope" });
  const targetProfileId = useWatch({ control, name: "targetProfileId" });
  const triggerType = useWatch({ control, name: "triggerType" });
  const frequency = useWatch({ control, name: "frequency" });
  const templateId = useWatch({ control, name: "templateId" });

  function applyTemplate(id: string | null) {
    const template = NOTIFICATION_TEMPLATES.find((t) => t.id === id);
    if (!template || !id) return;
    setValue("templateId", id);
    setValue("notificationType", template.notificationType);
    setValue("category", template.category);
    setValue("title", template.title, { shouldValidate: true });
    setValue("body", template.body, { shouldValidate: true });
  }

  async function onSubmit(values: NotificationCampaignFormOutput) {
    setFormError(null);
    const result = await createNotificationCampaign({
      title: values.title,
      body: values.body,
      category: values.category,
      notificationType: values.notificationType,
      targetScope: values.targetScope,
      targetProfileId: values.targetScope === "single_user" ? (values.targetProfileId ?? null) : null,
      triggerType: values.triggerType,
      scheduledAt: values.triggerType === "scheduled_once" ? new Date(values.scheduledAt!).toISOString() : null,
      cronExpression: values.triggerType === "recurring" ? toRecurringCronExpression(values) : null,
    });

    if (result.error) {
      setFormError(result.error);
      return;
    }

    toast.success("Kanpay notifikasyon kreye.");
    reset();
    setOpen(false);
    router.refresh();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button type="button" />}>
        <Plus data-icon="inline-start" aria-hidden />
        Kreye Notifikasyon
      </SheetTrigger>
      <SheetContent className="flex flex-col gap-0 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Kreye yon Notifikasyon</SheetTitle>
          <SheetDescription>
            Chwazi yon modèl pou ranpli fòm nan otomatikman, oswa ekri pwòp
            mesaj ou.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="templateId">Modèl (opsyonèl)</FieldLabel>
              <Select value={templateId} onValueChange={applyTemplate}>
                <SelectTrigger id="templateId" className="min-h-12 w-full">
                  <SelectValue placeholder="Chwazi yon modèl..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(
                    NOTIFICATION_TEMPLATES.reduce<Record<string, typeof NOTIFICATION_TEMPLATES>>((acc, t) => {
                      (acc[t.group] ??= []).push(t);
                      return acc;
                    }, {}),
                  ).map(([group, templates]) => (
                    <SelectGroup key={group}>
                      {templates.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field data-invalid={!!errors.targetScope || undefined}>
              <FieldLabel>Destinatè</FieldLabel>
              <Controller
                control={control}
                name="targetScope"
                render={({ field }) => (
                  <div className="grid grid-cols-3 gap-2">
                    {TARGET_SCOPE_OPTIONS.map(({ value, label, icon: Icon }) => {
                      const active = field.value === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => field.onChange(value)}
                          className={cn(
                            "flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-center text-xs font-medium transition-colors",
                            active
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border text-text-secondary hover:border-primary/40",
                          )}
                        >
                          <Icon className="size-4" aria-hidden />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
            </Field>

            {targetScope === "single_user" && (
              <Field data-invalid={!!errors.targetProfileId || undefined}>
                <FieldLabel>Itilizatè</FieldLabel>
                <UserPicker
                  users={userOptions}
                  selectedId={targetProfileId}
                  onSelect={(id) => setValue("targetProfileId", id, { shouldValidate: true })}
                />
                <FieldError errors={[errors.targetProfileId]} />
              </Field>
            )}

            <Field>
              <FieldLabel htmlFor="notificationType">Kalite</FieldLabel>
              <Controller
                control={control}
                name="notificationType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="notificationType" className="min-h-12 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {NOTIFICATION_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {NOTIFICATION_CAMPAIGN_TYPE_LABELS[type].label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field data-invalid={!!errors.title || undefined}>
              <FieldLabel htmlFor="title">Tit</FieldLabel>
              <Input id="title" {...register("title")} placeholder="Ex: Kredi an reta" />
              <FieldError errors={[errors.title]} />
            </Field>

            <Field data-invalid={!!errors.body || undefined}>
              <FieldLabel htmlFor="body">Mesaj</FieldLabel>
              <Textarea id="body" rows={3} {...register("body")} placeholder="Kontni notifikasyon an..." />
              <FieldError errors={[errors.body]} />
            </Field>

            <Field data-invalid={!!errors.triggerType || undefined}>
              <FieldLabel>Deklanchè</FieldLabel>
              <Controller
                control={control}
                name="triggerType"
                render={({ field }) => (
                  <RadioGroup value={field.value} onValueChange={field.onChange}>
                    {TRIGGER_TYPES.map((type) => (
                      <FieldLabel key={type} htmlFor={`triggerType-${type}`}>
                        <Field orientation="horizontal">
                          <RadioGroupItem value={type} id={`triggerType-${type}`} />
                          <FieldTitle>{NOTIFICATION_CAMPAIGN_TRIGGER_TYPE_LABELS[type]}</FieldTitle>
                        </Field>
                      </FieldLabel>
                    ))}
                  </RadioGroup>
                )}
              />
            </Field>

            {triggerType === "scheduled_once" && (
              <Field data-invalid={!!errors.scheduledAt || undefined}>
                <FieldLabel htmlFor="scheduledAt">Dat ak lè</FieldLabel>
                <Input id="scheduledAt" type="datetime-local" {...register("scheduledAt")} className="min-h-12" />
                <FieldError errors={[errors.scheduledAt]} />
              </Field>
            )}

            {triggerType === "recurring" && (
              <>
                <Field data-invalid={!!errors.frequency || undefined}>
                  <FieldLabel htmlFor="frequency">Frekans</FieldLabel>
                  <Controller
                    control={control}
                    name="frequency"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="frequency" className="min-h-12 w-full">
                          <SelectValue placeholder="Chwazi yon frekans" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="daily">Chak jou</SelectItem>
                            <SelectItem value="weekly">Chak semèn</SelectItem>
                            <SelectItem value="monthly">Chak mwa</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={[errors.frequency]} />
                </Field>

                {frequency === "weekly" && (
                  <Field data-invalid={!!errors.dayOfWeek || undefined}>
                    <FieldLabel htmlFor="dayOfWeek">Jou</FieldLabel>
                    <Controller
                      control={control}
                      name="dayOfWeek"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="dayOfWeek" className="min-h-12 w-full">
                            <SelectValue placeholder="Chwazi yon jou" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {WEEKDAY_OPTIONS.map((day) => (
                                <SelectItem key={day.value} value={day.value}>
                                  {day.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError errors={[errors.dayOfWeek]} />
                  </Field>
                )}

                {frequency === "monthly" && (
                  <Field data-invalid={!!errors.dayOfMonth || undefined}>
                    <FieldLabel htmlFor="dayOfMonth">Dat nan mwa a (1-28)</FieldLabel>
                    <Input id="dayOfMonth" type="number" min={1} max={28} {...register("dayOfMonth")} className="min-h-12" />
                    <FieldError errors={[errors.dayOfMonth]} />
                  </Field>
                )}

                <Field data-invalid={!!errors.timeOfDay || undefined}>
                  <FieldLabel htmlFor="timeOfDay">Lè</FieldLabel>
                  <Input id="timeOfDay" type="time" {...register("timeOfDay")} className="min-h-12" />
                  <FieldError errors={[errors.timeOfDay]} />
                </Field>
              </>
            )}
          </FieldGroup>

          {formError && (
            <p role="alert" className="text-sm font-medium text-danger">
              {formError}
            </p>
          )}

          <SheetFooter className="flex-row justify-end gap-2 px-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="min-h-12">
              Anile
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-h-12">
              {isSubmitting && <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden />}
              Voye
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
