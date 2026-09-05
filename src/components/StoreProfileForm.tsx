"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/storage/uploadImage";
import {
  storeProfileSchema,
  type StoreProfileFormInput,
  type StoreProfileFormOutput,
} from "@/lib/validations/store";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import type { Store } from "@/types";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export function StoreProfileForm({ store }: { store: Store }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState(store.logo_url);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StoreProfileFormInput, unknown, StoreProfileFormOutput>({
    resolver: zodResolver(storeProfileSchema),
    defaultValues: {
      name: store.name,
      address: store.address ?? "",
      phone: store.phone ?? "",
    },
  });

  async function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploadingLogo(true);
    const { publicUrl, error } = await uploadImage({
      bucket: "store-logos",
      storeId: store.id,
      fileName: "logo",
      file,
    });
    setIsUploadingLogo(false);

    if (error || !publicUrl) {
      toast.error(error ?? "Nou pa t ka voye lojo a.");
      return;
    }

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("stores")
      .update({ logo_url: publicUrl })
      .eq("id", store.id);

    if (updateError) {
      toast.error("Nou pa t ka anrejistre lojo a.");
      return;
    }

    setLogoUrl(publicUrl);
    toast.success("Lojo a chanje.");
    router.refresh();
  }

  async function onSubmit(values: StoreProfileFormOutput) {
    setFormError(null);
    const supabase = createClient();

    const { error } = await supabase
      .from("stores")
      .update({
        name: values.name,
        address: values.address || null,
        phone: values.phone || null,
      })
      .eq("id", store.id);

    if (error) {
      setFormError("Nou pa t ka anrejistre chanjman yo. Eseye ankò.");
      return;
    }

    toast.success("Pwofil boutik la mizajou.");
    router.refresh();
  }

  return (
    <div className="flex max-w-lg flex-col gap-5 rounded-lg border border-border p-4">
      <div className="flex items-center gap-4">
        <Avatar size="lg" className="size-16">
          <AvatarImage src={logoUrl ?? undefined} alt={store.name} />
          <AvatarFallback className="text-lg">{initials(store.name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleLogoChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploadingLogo}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploadingLogo && (
              <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden />
            )}
            Chanje lojo
          </Button>
          <p className="text-xs text-text-secondary">JPEG, PNG oswa WebP · 3 Mo maks</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.name || undefined}>
            <FieldLabel htmlFor="store-name">Non boutik la</FieldLabel>
            <Input id="store-name" aria-invalid={!!errors.name} {...register("name")} />
            <FieldError errors={[errors.name]} />
          </Field>

          <Field data-invalid={!!errors.address || undefined}>
            <FieldLabel htmlFor="store-address">Adrès</FieldLabel>
            <Input id="store-address" aria-invalid={!!errors.address} {...register("address")} />
            <FieldError errors={[errors.address]} />
          </Field>

          <Field data-invalid={!!errors.phone || undefined}>
            <FieldLabel htmlFor="store-phone">Telefòn</FieldLabel>
            <Input id="store-phone" aria-invalid={!!errors.phone} {...register("phone")} />
            <FieldError errors={[errors.phone]} />
          </Field>

          {formError && (
            <p role="alert" className="text-sm font-medium text-danger">
              {formError}
            </p>
          )}

          <div>
            <Button type="submit" disabled={isSubmitting} className="min-h-12">
              {isSubmitting && (
                <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden />
              )}
              Anrejistre
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}
