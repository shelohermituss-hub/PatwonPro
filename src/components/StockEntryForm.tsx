"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLiveQuery } from "dexie-react-hooks";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { pullProducts } from "@/lib/sync/products";
import { createStockEntry } from "@/lib/stock/createStockEntry";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { STOCK_ENTRY_TYPE_LABELS } from "@/lib/stock/labels";
import {
  stockEntrySchema,
  type StockEntryFormInput,
  type StockEntryFormOutput,
} from "@/lib/validations/stockEntry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  FieldTitle,
  FieldLegend,
  FieldSet,
  FieldError,
} from "@/components/ui/field";

const ENTRY_TYPES = ["restock", "correction", "adjustment"] as const;

export function StockEntryForm() {
  const router = useRouter();
  const { profile } = useCurrentProfile();
  const products = useLiveQuery(() => db.products.toArray(), []);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.store_id) return;
    void pullProducts(profile.store_id);
  }, [profile?.store_id]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StockEntryFormInput, unknown, StockEntryFormOutput>({
    resolver: zodResolver(stockEntrySchema),
    defaultValues: { productId: "", entryType: "restock", quantityDelta: 0, reason: "" },
  });

  const productId = useWatch({ control, name: "productId" });
  const selectedProduct = products?.find((p) => p.id === productId);

  async function onSubmit(values: StockEntryFormOutput) {
    setFormError(null);

    if (!profile?.store_id) {
      setFormError("Nou pa t ka jwenn boutik ou. Rekonekte epi eseye ankò.");
      return;
    }

    await createStockEntry({
      storeId: profile.store_id,
      employeeId: profile.id,
      productId: values.productId,
      entryType: values.entryType,
      quantityDelta: values.quantityDelta,
      reason: values.reason,
    });

    toast.success("Antre stòk anrejistre.");
    router.push("/stock-entries");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-md">
      <FieldGroup>
        <Field data-invalid={!!errors.productId || undefined}>
          <FieldLabel htmlFor="productId">Pwodwi</FieldLabel>
          <Controller
            control={control}
            name="productId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={(value) => field.onChange(value ?? "")}>
                <SelectTrigger id="productId" className="min-h-12 w-full">
                  <SelectValue placeholder="Chwazi yon pwodwi">
                    {(value: string) =>
                      products?.find((p) => p.id === value)?.name ?? "Chwazi yon pwodwi"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {(products ?? []).map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.productId]} />
          {selectedProduct && (
            <p className="text-sm text-text-secondary">
              Stòk aktyèl: {selectedProduct.stock_quantity} {selectedProduct.unit}
            </p>
          )}
        </Field>

        <FieldSet>
          <FieldLegend variant="label">Kalite antre</FieldLegend>
          <Controller
            control={control}
            name="entryType"
            render={({ field }) => (
              <RadioGroup value={field.value} onValueChange={field.onChange}>
                {ENTRY_TYPES.map((type) => (
                  <FieldLabel key={type} htmlFor={`entryType-${type}`}>
                    <Field orientation="horizontal">
                      <RadioGroupItem value={type} id={`entryType-${type}`} />
                      <FieldTitle>{STOCK_ENTRY_TYPE_LABELS[type]}</FieldTitle>
                    </Field>
                  </FieldLabel>
                ))}
              </RadioGroup>
            )}
          />
        </FieldSet>

        <Field data-invalid={!!errors.quantityDelta || undefined}>
          <FieldLabel htmlFor="quantityDelta">
            Kantite (+ pou ogmante, - pou diminye)
          </FieldLabel>
          <Input
            id="quantityDelta"
            type="number"
            step="0.01"
            inputMode="decimal"
            aria-invalid={!!errors.quantityDelta}
            className="min-h-12 text-base"
            {...register("quantityDelta")}
          />
          <FieldError errors={[errors.quantityDelta]} />
        </Field>

        <Field data-invalid={!!errors.reason || undefined}>
          <FieldLabel htmlFor="reason">Rezon (opsyonèl)</FieldLabel>
          <Textarea
            id="reason"
            rows={3}
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

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting} className="min-h-12">
            {isSubmitting && (
              <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden />
            )}
            Anrejistre antre a
          </Button>
          <Button
            type="button"
            variant="outline"
            className="min-h-12"
            onClick={() => router.push("/stock-entries")}
          >
            Anile
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
