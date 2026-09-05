"use client";

import { useState } from "react";
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
  FieldError,
} from "@/components/ui/field";
import { createClient } from "@/lib/supabase/client";
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/auth";

export function OnboardingForm({ defaultFullName }: { defaultFullName: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { storeName: "", fullName: defaultFullName },
  });

  async function onSubmit(values: OnboardingInput) {
    setFormError(null);
    const supabase = createClient();

    const { error: rpcError } = await supabase.rpc("register_owner", {
      store_name: values.storeName,
      owner_full_name: values.fullName,
    });

    if (rpcError) {
      setFormError("Nou pa t ka mete boutik la kanpe. Eseye ankò.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold text-foreground">Byenveni!</h1>
          <p className="text-sm text-text-secondary">
            Yon dènye etap: kreye boutik ou pou kòmanse.
          </p>
        </div>

        <Field data-invalid={!!errors.storeName || undefined}>
          <FieldLabel htmlFor="storeName">Non boutik la</FieldLabel>
          <Input
            id="storeName"
            placeholder="Boutik Marie"
            aria-invalid={!!errors.storeName}
            {...register("storeName")}
          />
          <FieldError errors={[errors.storeName]} />
        </Field>

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
          Kreye boutik la
        </Button>
      </FieldGroup>
    </form>
  );
}
