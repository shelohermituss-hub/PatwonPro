"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Plus } from "lucide-react";
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
import {
  notificationCampaignSchema,
  toRecurringCronExpression,
  type NotificationCampaignFormInput,
  type NotificationCampaignFormOutput,
} from "@/lib/validations/notificationCampaign";
import { createNotificationCampaign } from "@/lib/admin/actions/notificationCampaigns";
import {
  NOTIFICATION_CAMPAIGN_TARGET_SCOPE_LABELS,
  NOTIFICATION_CAMPAIGN_TRIGGER_TYPE_LABELS,
} from "@/lib/admin/labels";
import type { StoreOption } from "@/lib/admin/queries/notificationCampaigns";

const TARGET_SCOPES = ["all_stores", "single_store", "admin_team"] as const;
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

export function NewNotificationCampaignSheet({ storeOptions }: { storeOptions: StoreOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<NotificationCampaignFormInput, unknown, NotificationCampaignFormOutput>({
    resolver: zodResolver(notificationCampaignSchema),
    defaultValues: { targetScope: "all_stores", triggerType: "immediate" },
  });

  const targetScope = useWatch({ control, name: "targetScope" });
  const triggerType = useWatch({ control, name: "triggerType" });
  const frequency = useWatch({ control, name: "frequency" });

  async function onSubmit(values: NotificationCampaignFormOutput) {
    setFormError(null);
    const result = await createNotificationCampaign({
      title: values.title,
      body: values.body,
      targetScope: values.targetScope,
      targetStoreId: values.targetScope === "single_store" ? (values.targetStoreId ?? null) : null,
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
          <SheetTitle>Nouvo Kanpay Notifikasyon</SheetTitle>
          <SheetDescription>
            Kreye yon anons ki ale bay boutik yo (oswa ekip admin la) — chwazi
            lè li dwe voye a.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
          <FieldGroup>
            <Field data-invalid={!!errors.title || undefined}>
              <FieldLabel htmlFor="title">Tit</FieldLabel>
              <Input id="title" {...register("title")} placeholder="Antretyen pwograme" />
              <FieldError errors={[errors.title]} />
            </Field>

            <Field data-invalid={!!errors.body || undefined}>
              <FieldLabel htmlFor="body">Mesaj</FieldLabel>
              <Textarea id="body" rows={3} {...register("body")} placeholder="Detay anons lan..." />
              <FieldError errors={[errors.body]} />
            </Field>

            <Field data-invalid={!!errors.targetScope || undefined}>
              <FieldLabel htmlFor="targetScope">Kiyès pou resevwa l</FieldLabel>
              <Controller
                control={control}
                name="targetScope"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="targetScope" className="min-h-12 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {TARGET_SCOPES.map((scope) => (
                          <SelectItem key={scope} value={scope}>
                            {NOTIFICATION_CAMPAIGN_TARGET_SCOPE_LABELS[scope]}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            {targetScope === "single_store" && (
              <Field data-invalid={!!errors.targetStoreId || undefined}>
                <FieldLabel htmlFor="targetStoreId">Boutik</FieldLabel>
                <Controller
                  control={control}
                  name="targetStoreId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="targetStoreId" className="min-h-12 w-full">
                        <SelectValue placeholder="Chwazi yon boutik" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {storeOptions.map((store) => (
                            <SelectItem key={store.id} value={store.id}>
                              {store.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.targetStoreId]} />
              </Field>
            )}

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

          <SheetFooter className="px-0">
            <Button type="submit" disabled={isSubmitting} className="min-h-12">
              {isSubmitting && <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden />}
              Kreye Kanpay
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
