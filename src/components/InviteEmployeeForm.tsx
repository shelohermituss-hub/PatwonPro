"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { inviteEmployee } from "@/lib/auth/inviteEmployee";
import {
  inviteEmployeeSchema,
  type InviteEmployeeInput,
} from "@/lib/validations/invite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

export function InviteEmployeeForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteEmployeeInput>({
    resolver: zodResolver(inviteEmployeeSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: InviteEmployeeInput) {
    setFormError(null);
    const { error } = await inviteEmployee(values);

    if (error) {
      setFormError(error);
      return;
    }

    toast.success("Envitasyon voye.");
    reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex items-start gap-3">
      <FieldGroup>
        <Field data-invalid={!!errors.email || undefined}>
          <FieldLabel htmlFor="invite-email" className="sr-only">
            Imèl anplwaye
          </FieldLabel>
          <Input
            id="invite-email"
            type="email"
            placeholder="anplwaye@boutikou.com"
            className="min-h-12"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
          {formError && (
            <p role="alert" className="text-sm font-medium text-danger">
              {formError}
            </p>
          )}
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={isSubmitting} className="min-h-12">
        {isSubmitting && (
          <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden />
        )}
        Envite
      </Button>
    </form>
  );
}
