"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLiveQuery } from "dexie-react-hooks";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { pullCustomers } from "@/lib/sync/customers";
import { createCredit } from "@/lib/credits/createCredit";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { creditSchema, type CreditFormInput, type CreditFormOutput } from "@/lib/validations/credit";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

export default function NewCreditPage() {
  const router = useRouter();
  const { profile } = useCurrentProfile();
  const customers = useLiveQuery(() => db.customers.toArray(), []);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.store_id) return;
    void pullCustomers(profile.store_id);
  }, [profile?.store_id]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreditFormInput, unknown, CreditFormOutput>({
    resolver: zodResolver(creditSchema),
    defaultValues: { customerId: "", amount: 0 },
  });

  const customerId = useWatch({ control, name: "customerId" });
  const amount = useWatch({ control, name: "amount" });
  const selectedCustomer = customers?.find((c) => c.id === customerId);
  const exceedsCreditLimit =
    selectedCustomer !== undefined &&
    Number(amount || 0) + selectedCustomer.credit_balance > selectedCustomer.credit_limit;

  async function onSubmit(values: CreditFormOutput) {
    setFormError(null);

    if (!profile?.store_id) {
      setFormError("Nou pa t ka jwenn boutik ou. Rekonekte epi eseye ankò.");
      return;
    }

    const sale = await createCredit({
      storeId: profile.store_id,
      employeeId: profile.id,
      customerId: values.customerId,
      amount: values.amount,
    });

    toast.success("Kredi anrejistre.");
    router.push(`/credits/${sale.id}`);
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-foreground">Nouvo Kredi</h1>
        <p className="text-text-secondary">
          Anrejistre yon dèt pou yon kliyan. Li disponib imedyatman, menm san
          entènèt.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-md">
        <FieldGroup>
          <Field data-invalid={!!errors.customerId || undefined}>
            <FieldLabel htmlFor="customerId">Kliyan</FieldLabel>
            <Controller
              control={control}
              name="customerId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={(value) => field.onChange(value ?? "")}>
                  <SelectTrigger id="customerId" className="min-h-12 w-full">
                    <SelectValue placeholder="Chwazi yon kliyan">
                      {(value: string) =>
                        customers?.find((c) => c.id === value)?.full_name ?? "Chwazi yon kliyan"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {(customers ?? []).map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.full_name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.customerId]} />
          </Field>

          <Field data-invalid={!!errors.amount || undefined}>
            <FieldLabel htmlFor="amount">Montan (HTG)</FieldLabel>
            <Input
              id="amount"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              aria-invalid={!!errors.amount}
              className="min-h-12 text-base"
              {...register("amount")}
            />
            <FieldError errors={[errors.amount]} />
          </Field>

          {selectedCustomer && (
            <p className="text-sm text-text-secondary">
              {selectedCustomer.full_name} deja dwe{" "}
              {formatCurrency(selectedCustomer.credit_balance)} (limit{" "}
              {formatCurrency(selectedCustomer.credit_limit)}).
              {exceedsCreditLimit && (
                <span className="block font-medium text-warning">
                  ⚠ Kredi sa a ap depase limit kliyan an — ou ka kontinye kanmenm.
                </span>
              )}
            </p>
          )}

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
              Anrejistre kredi a
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-12"
              onClick={() => router.push("/credits")}
            >
              Anile
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}
