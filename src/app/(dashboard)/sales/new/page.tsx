"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { Icons } from "@/lib/icons";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { pullProducts } from "@/lib/sync/products";
import { pullCustomers } from "@/lib/sync/customers";
import { checkoutSale } from "@/lib/pos/checkout";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { useCart } from "@/hooks/useCart";
import { useStorePaymentConfig } from "@/hooks/useStorePaymentConfig";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { CartPanel } from "@/components/pos/CartPanel";
import { MobilePaymentConfirmDialog } from "@/components/pos/MobilePaymentConfirmDialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/format";
import type { GatewayPaymentMethod } from "@/lib/payments/gateway";
import type { PaymentMethod, Sale } from "@/types";

export default function NewSalePage() {
  const { profile } = useCurrentProfile();
  const cart = useCart();
  const customers = useLiveQuery(() => db.customers.toArray(), []);
  const { config: paymentConfig } = useStorePaymentConfig(profile?.store_id);

  const [discount, setDiscount] = useState(0);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [cashReceived, setCashReceived] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingMobileMethod, setPendingMobileMethod] = useState<GatewayPaymentMethod | null>(null);
  const [completedSale, setCompletedSale] = useState<
    (Sale & { change: number | null }) | null
  >(null);

  useEffect(() => {
    if (!profile?.store_id) return;
    void pullProducts(profile.store_id);
    void pullCustomers(profile.store_id);
  }, [profile?.store_id]);

  async function completeSale(method: PaymentMethod) {
    if (!profile?.store_id) {
      toast.error("Nou pa t ka jwenn boutik ou. Rekonekte epi eseye ankò.");
      return;
    }

    setIsSubmitting(true);
    try {
      const total = Math.max(cart.subtotal - discount, 0);
      const change = method === "cash" ? Number(cashReceived) - total : null;

      const sale = await checkoutSale({
        storeId: profile.store_id,
        employeeId: profile.id,
        customerId,
        lines: cart.lines,
        discount,
        paymentMethod: method,
      });

      setCompletedSale({ ...sale, change });
      cart.clear();
      setDiscount(0);
      setCustomerId(null);
      setCashReceived("");
      setPaymentMethod("cash");
      setPendingMobileMethod(null);
    } catch {
      toast.error("Nou pa t ka kompete vant lan. Eseye ankò.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCheckout() {
    if (paymentMethod === "moncash" || paymentMethod === "natcash") {
      setPendingMobileMethod(paymentMethod);
      return;
    }
    void completeSale(paymentMethod);
  }

  const mobilePhone =
    pendingMobileMethod === "moncash" ? paymentConfig?.moncashPhone ?? null : paymentConfig?.natcashPhone ?? null;
  const mobileQrUrl =
    pendingMobileMethod === "moncash" ? paymentConfig?.moncashQrUrl ?? null : paymentConfig?.natcashQrUrl ?? null;

  return (
    <div className="grid h-full grid-cols-[1fr_400px] overflow-hidden">
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h1 className="text-lg font-semibold text-foreground">Pwen Vant</h1>
          <Link href="/sales" className={cn(buttonVariants({ variant: "outline" }))}>
            <Icons.history data-icon="inline-start" aria-hidden />
            Istorik Vant
          </Link>
        </div>
        <div className="min-h-0 flex-1">
          <ProductGrid onSelect={cart.addProduct} />
        </div>
      </div>

      <CartPanel
        lines={cart.lines}
        subtotal={cart.subtotal}
        discount={discount}
        onDiscountChange={setDiscount}
        onQuantityChange={cart.setQuantity}
        onRemove={cart.removeLine}
        customers={customers}
        customerId={customerId}
        onCustomerChange={setCustomerId}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        cashReceived={cashReceived}
        onCashReceivedChange={setCashReceived}
        onCheckout={handleCheckout}
        isSubmitting={isSubmitting}
      />

      <MobilePaymentConfirmDialog
        method={pendingMobileMethod}
        amount={Math.max(cart.subtotal - discount, 0)}
        phone={mobilePhone}
        qrUrl={mobileQrUrl}
        isSubmitting={isSubmitting}
        onConfirm={() => pendingMobileMethod && void completeSale(pendingMobileMethod)}
        onCancel={() => setPendingMobileMethod(null)}
      />

      <Dialog
        open={!!completedSale}
        onOpenChange={(open) => !open && setCompletedSale(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vant konplete</DialogTitle>
            <DialogDescription>
              Vant lan anrejistre. Li ap senkwonize otomatikman.
            </DialogDescription>
          </DialogHeader>

          {completedSale && (
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Total</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(completedSale.total)}
                </span>
              </div>
              {completedSale.change !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Monnen remèt</span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(completedSale.change)}
                  </span>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Link
              href={`/sales/${completedSale?.id}`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Wè Detay Vant lan
            </Link>
            <Button onClick={() => setCompletedSale(null)}>Nouvo Vant</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
