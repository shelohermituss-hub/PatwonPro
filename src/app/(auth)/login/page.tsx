"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword(values);

    if (error || !data.user) {
      setFormError("Imèl oswa modpas la pa kòrèk.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    const next =
      profile?.role === "platform_admin"
        ? "/admin"
        : searchParams.get("next") || "/dashboard";
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold text-foreground">Konekte</h1>
          <p className="text-sm text-text-secondary">
            Antre nan kont boutik ou.
          </p>
        </div>

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
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
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
          Konekte
        </Button>

        <p className="text-center text-sm text-text-secondary">
          Ou pa gen kont?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Kreye yon boutik
          </Link>
        </p>

        <SocialAuthButtons />
      </FieldGroup>
    </form>
  );
}
