"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { createClient } from "@/lib/supabase/client";
import { acceptInviteSchema, type AcceptInviteInput } from "@/lib/validations/auth";

export default function AcceptInvitePage() {
  return (
    <Suspense>
      <AcceptInviteForm />
    </Suspense>
  );
}

function AcceptInviteForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcceptInviteInput>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: { fullName: "", password: "" },
  });

  async function onSubmit(values: AcceptInviteInput) {
    setFormError(null);
    const supabase = createClient();

    const { error: passwordError } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (passwordError) {
      setFormError("Nou pa t ka konfigire modpas la. Eseye ankò.");
      return;
    }

    const { error: rpcError } = await supabase.rpc("accept_employee_invite", {
      employee_full_name: values.fullName,
    });

    if (rpcError) {
      setFormError(
        "Envitasyon sa a pa valid, oswa li ekspire. Kontakte owner boutik ou.",
      );
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold text-foreground">
            Byenveni!
          </h1>
          <p className="text-sm text-text-secondary">
            Fini konfigirasyon kont ou pou kòmanse travay.
          </p>
        </div>

        <Field data-invalid={!!errors.fullName || undefined}>
          <FieldLabel htmlFor="fullName">Non ou</FieldLabel>
          <Input
            id="fullName"
            autoComplete="name"
            placeholder="Marie Joseph"
            aria-invalid={!!errors.fullName}
            {...register("fullName")}
          />
          <FieldError errors={[errors.fullName]} />
        </Field>

        <Field data-invalid={!!errors.password || undefined}>
          <FieldLabel htmlFor="password">Chwazi yon modpas</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <FieldDescription>Omwen 8 karaktè.</FieldDescription>
          <FieldError errors={[errors.password]} />
        </Field>

        {formError && (
          <p role="alert" className="text-sm font-medium text-danger">
            {formError}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} className="min-h-12 w-full">
          {isSubmitting && (
            <LoaderCircle
              className="animate-spin"
              data-icon="inline-start"
              aria-hidden
            />
          )}
          Kòmanse
        </Button>
      </FieldGroup>
    </form>
  );
}
