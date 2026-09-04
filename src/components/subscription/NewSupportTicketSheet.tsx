"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { Icons } from "@/lib/icons";
import { toast } from "sonner";
import { createSupportTicket } from "@/lib/support/createSupportTicket";
import {
  supportTicketSchema,
  type SupportTicketFormInput,
  type SupportTicketFormOutput,
} from "@/lib/validations/supportTicket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export function NewSupportTicketSheet({
  storeId,
  employeeId,
}: {
  storeId: string;
  employeeId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupportTicketFormInput, unknown, SupportTicketFormOutput>({
    resolver: zodResolver(supportTicketSchema),
    defaultValues: { subject: "", message: "" },
  });

  async function onSubmit(values: SupportTicketFormOutput) {
    setFormError(null);

    const { error } = await createSupportTicket({
      storeId,
      createdBy: employeeId,
      subject: values.subject,
      message: values.message,
    });

    if (error) {
      setFormError("Nou pa t ka voye tikè a. Eseye ankò.");
      return;
    }

    toast.success("Tikè sipò voye.");
    reset();
    setOpen(false);
    router.refresh();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button className="min-h-12" />}>
        <Icons.add data-icon="inline-start" aria-hidden />
        Nouvo Tikè
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nouvo tikè sipò</SheetTitle>
          <SheetDescription>
            Ekri pwoblèm ou an; ekip PatwonPro ap reponn ou.
          </SheetDescription>
        </SheetHeader>

        <form
          id="new-ticket-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-1 flex-col gap-4 px-4"
        >
          <FieldGroup>
            <Field data-invalid={!!errors.subject || undefined}>
              <FieldLabel htmlFor="subject">Sijè</FieldLabel>
              <Input
                id="subject"
                className="min-h-12"
                aria-invalid={!!errors.subject}
                {...register("subject")}
              />
              <FieldError errors={[errors.subject]} />
            </Field>

            <Field data-invalid={!!errors.message || undefined}>
              <FieldLabel htmlFor="message">Mesaj</FieldLabel>
              <Textarea
                id="message"
                rows={6}
                aria-invalid={!!errors.message}
                {...register("message")}
              />
              <FieldError errors={[errors.message]} />
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
            form="new-ticket-form"
            disabled={isSubmitting}
            className="min-h-12"
          >
            {isSubmitting && (
              <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden />
            )}
            Voye tikè a
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
