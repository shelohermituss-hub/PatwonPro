"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { haptics } from "@/lib/haptics";
import { isOwner } from "@/lib/auth/roles";
import { createCustomer } from "@/lib/customers/createCustomer";
import { customerSchema, type CustomerFormInput, type CustomerFormOutput } from "@/lib/validations/customer";
import { CustomerAvatar } from "@/components/CustomerAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import type { Profile, Customer } from "@/types";

/**
 * Only an owner can create a customer (RLS `customers_write_owner`,
 * migration 007) — an employee sees a disabled trigger with a hint to
 * ask the owner, instead of a button that would just fail on submit.
 */
export function NewCustomerDialog({
  profile,
  storeId,
  onCreated,
}: {
  profile: Profile | null;
  storeId: string;
  onCreated: (customer: Customer) => void;
}) {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const owner = isOwner(profile);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormInput, unknown, CustomerFormOutput>({
    resolver: zodResolver(customerSchema),
    defaultValues: { fullName: "", phone: "", creditLimit: 0 },
  });

  async function onSubmit(values: CustomerFormOutput) {
    setFormError(null);
    try {
      const customer = await createCustomer(storeId, values);
      haptics.success();
      toast.success(`${customer.full_name} ajoute.`);
      reset();
      setOpen(false);
      onCreated(customer);
    } catch (error) {
      haptics.error();
      setFormError(error instanceof Error ? error.message : "Yon erè fèt.");
    }
  }

  if (!owner) {
    return (
      <Button type="button" variant="outline" size="sm" disabled title="Mande pwopriyetè boutik la ajoute yon nouvo kliyan.">
        <Plus data-icon="inline-start" aria-hidden />
        Nouvo Kliyan
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) reset(); }}>
      <DialogTrigger render={<Button type="button" variant="outline" size="sm" />}>
        <Plus data-icon="inline-start" aria-hidden />
        Nouvo Kliyan
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvo Kliyan</DialogTitle>
          <DialogDescription>Chak nouvo kliyan resevwa yon avatar default automatikman.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3">
          <CustomerAvatar size="lg" />
          <p className="text-sm text-text-secondary">Avatar default kliyan an</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <FieldGroup>
            <Field data-invalid={!!errors.fullName || undefined}>
              <FieldLabel htmlFor="new-customer-name">Non Kliyan</FieldLabel>
              <Input id="new-customer-name" {...register("fullName")} />
              <FieldError errors={[errors.fullName]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="new-customer-phone">Telefòn (opsyonèl)</FieldLabel>
              <Input id="new-customer-phone" {...register("phone")} />
            </Field>
            <Field data-invalid={!!errors.creditLimit || undefined}>
              <FieldLabel htmlFor="new-customer-limit">Limit Kredi (HTG)</FieldLabel>
              <Input id="new-customer-limit" type="number" min={0} step="0.01" {...register("creditLimit")} />
              <FieldError errors={[errors.creditLimit]} />
            </Field>
          </FieldGroup>

          {formError && (
            <p role="alert" className="text-sm font-medium text-danger">
              {formError}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden />}
              Ajoute Kliyan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
