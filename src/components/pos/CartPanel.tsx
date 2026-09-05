"use client";

import { Minus, Plus, Trash2, LoaderCircle } from "lucide-react";
import { Icons } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/format";
import { PAYMENT_METHOD_LABELS } from "@/lib/pos/labels";
import type { CartLine } from "@/hooks/useCart";
import type { Customer, PaymentMethod } from "@/types";

const PAYMENT_METHODS: PaymentMethod[] = ["cash", "moncash", "natcash", "credit"];

export function CartPanel({
  lines,
  subtotal,
  discount,
  onDiscountChange,
  onQuantityChange,
  onRemove,
  customers,
  customerId,
  onCustomerChange,
  paymentMethod,
  onPaymentMethodChange,
  cashReceived,
  onCashReceivedChange,
  onCheckout,
  isSubmitting,
}: {
  lines: CartLine[];
  subtotal: number;
  discount: number;
  onDiscountChange: (value: number) => void;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  customers: Customer[] | undefined;
  customerId: string | null;
  onCustomerChange: (id: string | null) => void;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  cashReceived: string;
  onCashReceivedChange: (value: string) => void;
  onCheckout: () => void;
  isSubmitting: boolean;
}) {
  const total = Math.max(subtotal - discount, 0);
  const cashReceivedNumber = Number(cashReceived) || 0;
  const change = cashReceivedNumber - total;

  const selectedCustomer = customers?.find((c) => c.id === customerId) ?? null;
  const exceedsCreditLimit =
    paymentMethod === "credit" &&
    selectedCustomer !== null &&
    selectedCustomer.credit_balance + total > selectedCustomer.credit_limit;

  const canCheckout =
    lines.length > 0 &&
    !isSubmitting &&
    (paymentMethod !== "cash" || cashReceivedNumber >= total) &&
    (paymentMethod !== "credit" || customerId !== null);

  return (
    <div className="flex h-full flex-col border-l border-border bg-surface">
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
          <Icons.pos className="size-5" aria-hidden />
          Panye
        </h2>

        {lines.length === 0 ? (
          <p className="py-10 text-center text-sm text-text-secondary">
            Panye a vid — tape sou yon pwodwi pou kòmanse.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {lines.map((line) => (
              <li
                key={line.productId}
                className="flex flex-col gap-2 rounded-lg border border-border p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {line.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(line.productId)}
                    aria-label={`Retire ${line.name} nan panye a`}
                    className="size-8 shrink-0 text-text-secondary hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => onQuantityChange(line.productId, line.quantity - 1)}
                      aria-label={`Diminye kantite pou ${line.name}`}
                      className="size-8"
                    >
                      <Minus className="size-3.5" aria-hidden />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium text-foreground">
                      {line.quantity}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => onQuantityChange(line.productId, line.quantity + 1)}
                      aria-label={`Ogmante kantite pou ${line.name}`}
                      disabled={line.quantity >= line.availableStock}
                      className="size-8"
                    >
                      <Plus className="size-3.5" aria-hidden />
                    </Button>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(line.unitPrice * line.quantity)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="customerId">Kliyan (opsyonèl)</FieldLabel>
            <Select
              value={customerId ?? "none"}
              onValueChange={(value) =>
                onCustomerChange(value && value !== "none" ? value : null)
              }
            >
              <SelectTrigger id="customerId" className="min-h-12 w-full">
                <SelectValue placeholder="Kliyan jenerik">
                  {(value: string) =>
                    value === "none"
                      ? "Kliyan jenerik"
                      : customers?.find((c) => c.id === value)?.full_name ?? "Kliyan jenerik"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="none">Kliyan jenerik</SelectItem>
                  {(customers ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.full_name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="discount">Rabè (HTG, opsyonèl)</FieldLabel>
            <Input
              id="discount"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={discount === 0 ? "" : discount}
              onChange={(e) => onDiscountChange(Number(e.target.value) || 0)}
              placeholder="0"
              className="min-h-12"
            />
          </Field>

          <Field>
            <FieldLabel>Mwayen peman</FieldLabel>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant={paymentMethod === value ? "default" : "outline"}
                  onClick={() => onPaymentMethodChange(value)}
                  className="min-h-11"
                >
                  {PAYMENT_METHOD_LABELS[value]}
                </Button>
              ))}
            </div>
          </Field>

          {paymentMethod === "cash" && (
            <Field>
              <FieldLabel htmlFor="cashReceived">Kach resevwa (HTG)</FieldLabel>
              <Input
                id="cashReceived"
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                value={cashReceived}
                onChange={(e) => onCashReceivedChange(e.target.value)}
                className="min-h-12 text-base"
                autoFocus
              />
              {cashReceived !== "" && (
                <p
                  className={
                    change >= 0
                      ? "text-sm font-medium text-success"
                      : "text-sm font-medium text-danger"
                  }
                >
                  {change >= 0
                    ? `Monnen pou remèt: ${formatCurrency(change)}`
                    : "Kach resevwa a pa ase."}
                </p>
              )}
            </Field>
          )}

          {paymentMethod === "credit" && (
            <p className="text-sm text-text-secondary">
              {customerId === null
                ? "Chwazi yon kliyan pou fè yon vant a kredi."
                : exceedsCreditLimit
                  ? "⚠ Vant sa a ap depase limit kredi kliyan an — ou ka kontinye kanmenm."
                  : null}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-border bg-surface p-4">
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>Soutotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex items-center justify-between text-sm text-text-secondary">
            <span>Rabè</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-lg font-bold text-foreground">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <Button
          type="button"
          disabled={!canCheckout}
          onClick={onCheckout}
          className="min-h-14 text-base font-semibold"
        >
          {isSubmitting && (
            <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden />
          )}
          Peye {formatCurrency(total)}
        </Button>
      </div>
    </div>
  );
}
