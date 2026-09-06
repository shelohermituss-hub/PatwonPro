"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/storage/uploadImage";
import {
  mobilePaymentConfigSchema,
  type MobilePaymentConfigFormInput,
  type MobilePaymentConfigFormOutput,
} from "@/lib/validations/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";
import type { Store } from "@/types";

function MethodCard({
  logoSrc,
  logoAlt,
  logoWidth,
  logoHeight,
  qrUrl,
  isUploading,
  onUploadClick,
  children,
}: {
  logoSrc: string;
  logoAlt: string;
  logoWidth: number;
  logoHeight: number;
  qrUrl: string | null;
  isUploading: boolean;
  onUploadClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-start">
      <div className="flex shrink-0 flex-col items-center gap-2">
        <Image src={logoSrc} alt={logoAlt} width={logoWidth} height={logoHeight} className="h-8 w-auto object-contain" />
        {qrUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote Supabase Storage public URL, not a static build asset
          <img src={qrUrl} alt={`Kòd QR ${logoAlt}`} className="size-24 rounded-md border border-border object-contain" />
        ) : (
          <div className="flex size-24 items-center justify-center rounded-md border border-dashed border-border text-center text-xs text-text-secondary">
            Pa gen kòd QR
          </div>
        )}
        <Button type="button" variant="outline" size="sm" disabled={isUploading} onClick={onUploadClick}>
          {isUploading && <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden />}
          {qrUrl ? "Chanje kòd QR" : "Voye kòd QR"}
        </Button>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export function MobilePaymentConfigForm({ store }: { store: Store }) {
  const router = useRouter();
  const moncashFileRef = useRef<HTMLInputElement>(null);
  const natcashFileRef = useRef<HTMLInputElement>(null);
  const [moncashQrUrl, setMoncashQrUrl] = useState(store.moncash_qr_url);
  const [natcashQrUrl, setNatcashQrUrl] = useState(store.natcash_qr_url);
  const [uploadingMoncash, setUploadingMoncash] = useState(false);
  const [uploadingNatcash, setUploadingNatcash] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MobilePaymentConfigFormInput, unknown, MobilePaymentConfigFormOutput>({
    resolver: zodResolver(mobilePaymentConfigSchema),
    defaultValues: {
      moncashPhone: store.moncash_phone ?? "",
      natcashPhone: store.natcash_phone ?? "",
    },
  });

  async function handleQrChange(
    event: React.ChangeEvent<HTMLInputElement>,
    method: "moncash" | "natcash",
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const setUploading = method === "moncash" ? setUploadingMoncash : setUploadingNatcash;
    const setQrUrl = method === "moncash" ? setMoncashQrUrl : setNatcashQrUrl;
    const column = method === "moncash" ? "moncash_qr_url" : "natcash_qr_url";

    setUploading(true);
    const { publicUrl, error } = await uploadImage({
      bucket: "payment-qr-codes",
      storeId: store.id,
      fileName: method,
      file,
    });
    setUploading(false);

    if (error || !publicUrl) {
      toast.error(error ?? "Nou pa t ka voye kòd QR a.");
      return;
    }

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("stores")
      .update({ [column]: publicUrl })
      .eq("id", store.id);

    if (updateError) {
      toast.error("Nou pa t ka anrejistre kòd QR a.");
      return;
    }

    setQrUrl(publicUrl);
    toast.success("Kòd QR anrejistre.");
    router.refresh();
  }

  async function onSubmit(values: MobilePaymentConfigFormOutput) {
    setFormError(null);
    const supabase = createClient();

    const { error } = await supabase
      .from("stores")
      .update({
        moncash_phone: values.moncashPhone || null,
        natcash_phone: values.natcashPhone || null,
      })
      .eq("id", store.id);

    if (error) {
      setFormError("Nou pa t ka anrejistre chanjman yo. Eseye ankò.");
      return;
    }

    toast.success("Konfigirasyon peman mobil mizajou.");
    router.refresh();
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-foreground">Peman Mobil (MonCash / NatCash)</h2>
        <p className="text-sm text-text-secondary">
          Antre nimewo ak kòd QR pwòp kont ou pou chak sèvis — kliyan ap voye lajan
          dirèkteman ba ou, epi w ap konfime nan Pwen Vant lan apre w tcheke sou
          pwòp telefòn ou.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <input
          ref={moncashFileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => void handleQrChange(e, "moncash")}
        />
        <input
          ref={natcashFileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => void handleQrChange(e, "natcash")}
        />

        <MethodCard
          logoSrc="/images/payment-methods/moncash-logo.png"
          logoAlt="MonCash"
          logoWidth={90}
          logoHeight={80}
          qrUrl={moncashQrUrl}
          isUploading={uploadingMoncash}
          onUploadClick={() => moncashFileRef.current?.click()}
        >
          <FieldGroup>
            <Field data-invalid={!!errors.moncashPhone || undefined}>
              <FieldLabel htmlFor="moncashPhone">Nimewo MonCash</FieldLabel>
              <Input id="moncashPhone" placeholder="+509 xxxx-xxxx" {...register("moncashPhone")} />
              <FieldError errors={[errors.moncashPhone]} />
            </Field>
          </FieldGroup>
        </MethodCard>

        <MethodCard
          logoSrc="/images/payment-methods/natcash-logo.png"
          logoAlt="NatCash"
          logoWidth={140}
          logoHeight={32}
          qrUrl={natcashQrUrl}
          isUploading={uploadingNatcash}
          onUploadClick={() => natcashFileRef.current?.click()}
        >
          <FieldGroup>
            <Field data-invalid={!!errors.natcashPhone || undefined}>
              <FieldLabel htmlFor="natcashPhone">Nimewo NatCash</FieldLabel>
              <Input id="natcashPhone" placeholder="+509 xxxx-xxxx" {...register("natcashPhone")} />
              <FieldError errors={[errors.natcashPhone]} />
            </Field>
          </FieldGroup>
        </MethodCard>

        <FieldDescription>JPEG, PNG oswa WebP · 3 Mo maksimòm pou kòd QR yo.</FieldDescription>

        {formError && (
          <p role="alert" className="text-sm font-medium text-danger">
            {formError}
          </p>
        )}

        <div>
          <Button type="submit" disabled={isSubmitting} className="min-h-12">
            {isSubmitting && <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden />}
            Anrejistre nimewo yo
          </Button>
        </div>
      </form>
    </div>
  );
}
