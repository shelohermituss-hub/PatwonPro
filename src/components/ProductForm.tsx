"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLiveQuery } from "dexie-react-hooks";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { db } from "@/lib/db";
import { syncPendingProducts } from "@/lib/sync/products";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { productSchema } from "@/lib/validations/product";
import type { z } from "zod";
import type { Product } from "@/types";

type ProductFormValues = z.input<typeof productSchema>;
type ProductFormOutput = z.output<typeof productSchema>;

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const { profile } = useCurrentProfile();
  const categories = useLiveQuery(() => db.categories.toArray(), []);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues, unknown, ProductFormOutput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      sku: product?.sku ?? "",
      categoryId: product?.category_id ?? undefined,
      unit: product?.unit ?? "inite",
      costPrice: product?.cost_price ?? 0,
      salePrice: product?.sale_price ?? 0,
      stockQuantity: product?.stock_quantity ?? 0,
      lowStockThreshold: product?.low_stock_threshold ?? 0,
      isActive: product?.is_active ?? true,
    },
  });

  async function onSubmit(values: ProductFormOutput) {
    setFormError(null);

    if (!profile?.store_id) {
      setFormError("Nou pa t ka jwenn boutik ou. Rekonekte epi eseye ankò.");
      return;
    }

    const now = new Date().toISOString();
    const id = product?.id ?? crypto.randomUUID();

    await db.products.put({
      id,
      store_id: profile.store_id,
      category_id: values.categoryId ?? null,
      name: values.name,
      sku: values.sku || null,
      unit: values.unit,
      cost_price: values.costPrice,
      sale_price: values.salePrice,
      stock_quantity: values.stockQuantity,
      low_stock_threshold: values.lowStockThreshold,
      is_active: values.isActive,
      sync_status: "pending",
      sync_attempts: 0,
      next_sync_at: null,
      created_at: product?.created_at ?? now,
      updated_at: now,
    });

    void syncPendingProducts();

    toast.success(product ? "Pwodwi modifye." : "Pwodwi anrejistre.");
    router.push("/products");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-2xl">
      <FieldGroup>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field data-invalid={!!errors.name || undefined}>
            <FieldLabel htmlFor="name">Non pwodwi a</FieldLabel>
            <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
            <FieldError errors={[errors.name]} />
          </Field>

          <Field data-invalid={!!errors.sku || undefined}>
            <FieldLabel htmlFor="sku">SKU (opsyonèl)</FieldLabel>
            <Input id="sku" aria-invalid={!!errors.sku} {...register("sku")} />
            <FieldError errors={[errors.sku]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="categoryId">Kategori</FieldLabel>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value ?? undefined)}
                >
                  <SelectTrigger id="categoryId" className="min-h-12 w-full">
                    <SelectValue placeholder="San kategori">
                      {(value: string) =>
                        (categories ?? []).find((c) => c.id === value)?.name ?? "San kategori"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {(categories ?? []).map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field data-invalid={!!errors.unit || undefined}>
            <FieldLabel htmlFor="unit">Inite</FieldLabel>
            <Input
              id="unit"
              placeholder="inite, liv, galon..."
              aria-invalid={!!errors.unit}
              {...register("unit")}
            />
            <FieldError errors={[errors.unit]} />
          </Field>

          <Field data-invalid={!!errors.costPrice || undefined}>
            <FieldLabel htmlFor="costPrice">Pri achte (HTG)</FieldLabel>
            <Input
              id="costPrice"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              aria-invalid={!!errors.costPrice}
              {...register("costPrice")}
            />
            <FieldError errors={[errors.costPrice]} />
          </Field>

          <Field data-invalid={!!errors.salePrice || undefined}>
            <FieldLabel htmlFor="salePrice">Pri vann (HTG)</FieldLabel>
            <Input
              id="salePrice"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              aria-invalid={!!errors.salePrice}
              {...register("salePrice")}
            />
            <FieldError errors={[errors.salePrice]} />
          </Field>

          <Field data-invalid={!!errors.stockQuantity || undefined}>
            <FieldLabel htmlFor="stockQuantity">Kantite an stòk</FieldLabel>
            <Input
              id="stockQuantity"
              type="number"
              min={0}
              step="1"
              inputMode="numeric"
              aria-invalid={!!errors.stockQuantity}
              {...register("stockQuantity")}
            />
            <FieldError errors={[errors.stockQuantity]} />
          </Field>

          <Field data-invalid={!!errors.lowStockThreshold || undefined}>
            <FieldLabel htmlFor="lowStockThreshold">Sèy alèt stòk ba</FieldLabel>
            <Input
              id="lowStockThreshold"
              type="number"
              min={0}
              step="1"
              inputMode="numeric"
              aria-invalid={!!errors.lowStockThreshold}
              {...register("lowStockThreshold")}
            />
            <FieldDescription>
              Yon badge &ldquo;Stòk ba&rdquo; parèt lè kantite a rive nan valè sa a.
            </FieldDescription>
            <FieldError errors={[errors.lowStockThreshold]} />
          </Field>
        </div>

        <Field orientation="horizontal">
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <Switch
                id="isActive"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <FieldLabel htmlFor="isActive">Pwodwi a aktif (vizib nan POS)</FieldLabel>
        </Field>

        {formError && (
          <p role="alert" className="text-sm font-medium text-danger">
            {formError}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting} className="min-h-12">
            {isSubmitting && (
              <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden />
            )}
            {product ? "Anrejistre chanjman yo" : "Anrejistre pwodwi a"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="min-h-12"
            onClick={() => router.push("/products")}
          >
            Anile
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
