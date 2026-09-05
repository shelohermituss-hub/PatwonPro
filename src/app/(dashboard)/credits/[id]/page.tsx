"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLiveQuery } from "dexie-react-hooks";
import { LoaderCircle } from "lucide-react";
import { Icons } from "@/lib/icons";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { recordCreditPayment } from "@/lib/credits/recordPayment";
import { computeCreditStatus } from "@/lib/credits/status";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { PAYMENT_METHOD_LABELS } from "@/lib/pos/labels";
import { CreditStatusBadge } from "@/components/CreditStatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  creditPaymentSchema,
  type CreditPaymentFormInput,
  type CreditPaymentFormOutput,
} from "@/lib/validations/credit";
import type { PaymentMethod } from "@/types";

const REPAYMENT_METHODS: PaymentMethod[] = ["cash", "moncash", "natcash"];

export default function CreditDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { profile } = useCurrentProfile();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Dexie's .get() resolves to `undefined` both while the query hasn't run
  // yet AND when the id truly doesn't exist — wrapping the result is what
  // makes those two cases distinguishable below (same pattern as the
  // product/sale detail pages).
  const result = useLiveQuery(async () => {
    const sale = await db.sales.get(id);
    if (!sale || sale.payment_method !== "credit") return { found: false as const };

    const [customer, paymentRows] = await Promise.all([
      sale.customer_id ? db.customers.get(sale.customer_id) : undefined,
      db.creditPayments.where("sale_id").equals(id).toArray(),
    ]);
    const payments = paymentRows.sort((a, b) => b.created_at.localeCompare(a.created_at));
    const paid = payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = Math.max(sale.total - paid, 0);

    return {
      found: true as const,
      sale,
      customer,
      payments,
      paid,
      remaining,
      status: computeCreditStatus(remaining, sale.created_at),
    };
  }, [id]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreditPaymentFormInput, unknown, CreditPaymentFormOutput>({
    resolver: zodResolver(
      creditPaymentSchema(result?.found ? result.remaining : Number.MAX_SAFE_INTEGER),
    ),
    defaultValues: { amount: 0, paymentMethod: "cash" },
  });

  async function onSubmitPayment(values: CreditPaymentFormOutput) {
    if (!result?.found || !profile?.store_id || !result.sale.customer_id) return;

    await recordCreditPayment({
      storeId: profile.store_id,
      customerId: result.sale.customer_id,
      saleId: result.sale.id,
      amount: values.amount,
      paymentMethod: values.paymentMethod,
    });

    toast.success("Vèsman anrejistre.");
    reset({ amount: 0, paymentMethod: "cash" });
    setDialogOpen(false);
  }

  function sendReminderPlaceholder(channel: "SMS" | "WhatsApp") {
    toast.info(`Rapèl ${channel} ap disponib nan yon pwochen vèsyon.`);
  }

  if (result === undefined) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!result.found) {
    return (
      <div className="p-6">
        <EmptyState
          illustration="credit"
          title="Nou pa jwenn kredi sa a"
          description="Li ka efase, oswa li poko senkwonize sou aparèy sa a."
          action={
            <Link href="/credits" className={cn(buttonVariants(), "mt-2 min-h-12")}>
              Tounen nan Kredi
            </Link>
          }
        />
      </div>
    );
  }

  const { sale, customer, payments, paid, remaining, status } = result;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold text-foreground">
            {customer?.full_name ?? "Kliyan"}
          </h1>
          <p className="text-text-secondary">
            Kredi kreye {formatDateTime(sale.created_at)}
          </p>
        </div>
        <CreditStatusBadge status={status} />
      </div>

      {status === "overdue" && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-danger"
        >
          <Icons.alert className="size-5 shrink-0" aria-hidden />
          <p className="text-sm font-medium">
            Dèt sa a an reta — pa gen vèsman depi plis pase 30 jou.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-surface p-4 sm:grid-cols-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-text-secondary">Kantite total</span>
          <span className="font-medium text-foreground">{formatCurrency(sale.total)}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-text-secondary">Peye</span>
          <span className="font-medium text-foreground">{formatCurrency(paid)}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-text-secondary">Rès pou peye</span>
          <span className="text-lg font-bold text-foreground">{formatCurrency(remaining)}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-text-secondary">Telefòn kliyan</span>
          <span className="font-medium text-foreground">{customer?.phone ?? "—"}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {remaining > 0 && (
          <Button className="min-h-12" onClick={() => setDialogOpen(true)}>
            Anrejistre yon vèsman
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          className="min-h-12"
          onClick={() => sendReminderPlaceholder("SMS")}
        >
          <Icons.sms data-icon="inline-start" aria-hidden />
          Voye rapèl SMS
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-12"
          onClick={() => sendReminderPlaceholder("WhatsApp")}
        >
          <Icons.callback data-icon="inline-start" aria-hidden />
          Voye rapèl WhatsApp
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Istorik vèsman</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-text-secondary">Poko gen vèsman anrejistre.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dat</TableHead>
                  <TableHead>Mwayen peman</TableHead>
                  <TableHead>Montan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="text-text-secondary">
                      {formatDateTime(payment.created_at)}
                    </TableCell>
                    <TableCell>{PAYMENT_METHOD_LABELS[payment.payment_method]}</TableCell>
                    <TableCell className="font-medium text-foreground">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anrejistre yon vèsman</DialogTitle>
            <DialogDescription>
              Rès pou peye: {formatCurrency(remaining)}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmitPayment)} noValidate>
            <FieldGroup>
              <Field data-invalid={!!errors.amount || undefined}>
                <FieldLabel htmlFor="payment-amount">Montan (HTG)</FieldLabel>
                <Input
                  id="payment-amount"
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

              <Field>
                <FieldLabel htmlFor="payment-method">Mwayen peman</FieldLabel>
                <Controller
                  control={control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => field.onChange(value ?? "cash")}
                    >
                      <SelectTrigger id="payment-method" className="min-h-12 w-full">
                        <SelectValue>
                          {(value: PaymentMethod) => PAYMENT_METHOD_LABELS[value]}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {REPAYMENT_METHODS.map((method) => (
                            <SelectItem key={method} value={method}>
                              {PAYMENT_METHOD_LABELS[method]}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting} className="min-h-12">
                  {isSubmitting && (
                    <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden />
                  )}
                  Anrejistre
                </Button>
              </DialogFooter>
            </FieldGroup>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
