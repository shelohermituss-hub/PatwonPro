"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { createReplacementRequest } from "@/lib/subscription/createReplacementRequest";
import {
  replacementRequestSchema,
  type ReplacementRequestFormInput,
  type ReplacementRequestFormOutput,
} from "@/lib/validations/replacementRequest";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

export function RequestReplacementSheet({
  storeId,
  deviceId,
  deviceName,
}: {
  storeId: string;
  deviceId: string;
  deviceName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReplacementRequestFormInput, unknown, ReplacementRequestFormOutput>({
    resolver: zodResolver(replacementRequestSchema),
    defaultValues: { reason: "" },
  });

  async function onSubmit(values: ReplacementRequestFormOutput) {
    setFormError(null);

    const { error } = await createReplacementRequest({
      storeId,
      deviceId,
      reason: values.reason,
    });

    if (error) {
      setFormError("Nou pa t ka voye demand lan. Eseye ankò.");
      return;
    }

    toast.success("Demand ranplasman voye.");
    reset();
    setOpen(false);
    router.refresh();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button type="button" variant="outline" size="sm" />}>
        Mande Ranplasman
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Mande ranplasman — {deviceName}</SheetTitle>
          <SheetDescription>
            Esplike pwoblèm ki fè w mande ranplasman tablèt sa a; ekip PatwonPro ap egzamine
            demand lan.
          </SheetDescription>
        </SheetHeader>

        <form
          id="replacement-request-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-1 flex-col gap-4 px-4"
        >
          <FieldGroup>
            <Field data-invalid={!!errors.reason || undefined}>
              <FieldLabel htmlFor="reason">Rezon</FieldLabel>
              <Textarea
                id="reason"
                rows={6}
                placeholder="Ex: Ekran an fele, batri a pa kenbe chaj..."
                aria-invalid={!!errors.reason}
                {...register("reason")}
              />
              <FieldError errors={[errors.reason]} />
            </Field>

            {formError && (
              <p role="alert" className="text-sm font-medium text-danger">
                {formError}
              </p>
            )}
          </FieldGroup>
        </form>

        <SheetFooter>
          <Button
            type="submit"
            form="replacement-request-form"
            disabled={isSubmitting}
            className="min-h-12"
          >
            {isSubmitting && (
              <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden />
            )}
            Voye demand lan
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
