"use client";

import { useState } from "react";
import Link from "next/link";
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
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";

export default function RegisterPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { storeName: "", fullName: "", email: "", password: "" },
  });

  async function onSubmit(values: RegisterInput) {
    setFormError(null);
    const supabase = createClient();

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    });

    if (signUpError) {
      setFormError(
        signUpError.message.includes("already registered")
          ? "Yon kont deja egziste ak imèl sa a."
          : "Nou pa t ka kreye kont la. Eseye ankò.",
      );
      return;
    }

    // If the Supabase project requires email confirmation, signUp() won't
    // return an active session — register_owner() needs auth.uid(), which
    // needs a session, so it can't run yet. The store gets created once
    // the confirmed user logs in for the first time instead (not yet
    // wired — flagged here rather than silently failing the RPC below).
    if (!signUpData.session) {
      setFormError(
        "Verifye imèl ou pou konfime kont la anvan ou ka kontinye.",
      );
      return;
    }

    // register_owner() is security definer and reads auth.uid() from the
    // session signUp() just created — see supabase/migrations/00000000000002_register_owner.sql.
    const { error: rpcError } = await supabase.rpc("register_owner", {
      store_name: values.storeName,
      owner_full_name: values.fullName,
    });

    if (rpcError) {
      setFormError("Kont ou kreye, men nou pa t ka mete boutik la kanpe. Kontakte sipò.");
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
            Kreye boutik ou
          </h1>
          <p className="text-sm text-text-secondary">
            Kèk enfòmasyon epi ou pare pou vann.
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

        <Field data-invalid={!!errors.email || undefined}>
          <FieldLabel htmlFor="email">Imèl</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="ou@boutikou.com"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field data-invalid={!!errors.password || undefined}>
          <FieldLabel htmlFor="password">Modpas</FieldLabel>
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
          Kreye boutik la
        </Button>

        <p className="text-center text-sm text-text-secondary">
          Ou gen yon kont deja?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Konekte
          </Link>
        </p>

        <SocialAuthButtons />
      </FieldGroup>
    </form>
  );
}
