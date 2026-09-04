import { db } from "@/lib/db";
import { syncPendingSales } from "@/lib/sync/sales";
import type { CartLine } from "@/hooks/useCart";
import type { PaymentMethod, Sale } from "@/types";

export interface CheckoutInput {
  storeId: string;
  employeeId: string;
  customerId: string | null;
  lines: CartLine[];
  discount: number;
  paymentMethod: PaymentMethod;
}

/**
 * Records a completed sale entirely offline-first: writes the Sale +
 * SaleItems to Dexie and optimistically decrements each product's local
 * stock, all in one Dexie transaction so a sale never lands without its
 * stock effect. Nothing here touches `customers.credit_balance` or pushes
 * the decremented `stock_quantity` to Supabase — both are owned by
 * `security definer` Postgres triggers instead (see
 * `00000000000007_role_based_write_access.sql`'s `sale_items` trigger and
 * `00000000000003_credit_balance_triggers.sql`). That split exists
 * because `employee` accounts can create sales/sale_items but can no
 * longer write `products`/`customers` directly (RLS, migration 007) — the
 * local `stock_quantity` patch below is left un-marked as `pending`
 * (`sync_status` untouched) purely for instant offline UI feedback; the
 * server-side truth comes from the trigger once the sale syncs.
 */
export async function checkoutSale(input: CheckoutInput): Promise<Sale> {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const subtotal = input.lines.reduce(
    (sum, line) => sum + line.unitPrice * line.quantity,
    0,
  );
  const total = Math.max(subtotal - input.discount, 0);

  const sale: Sale = {
    id,
    store_id: input.storeId,
    employee_id: input.employeeId,
    customer_id: input.customerId,
    subtotal,
    discount: input.discount,
    total,
    payment_method: input.paymentMethod,
    payment_status: input.paymentMethod === "credit" ? "credit" : "paid",
    sync_status: "pending",
    sync_attempts: 0,
    next_sync_at: null,
    created_at: now,
    updated_at: now,
  };

  await db.transaction("rw", db.sales, db.saleItems, db.products, async () => {
    await db.sales.add(sale);

    await db.saleItems.bulkAdd(
      input.lines.map((line) => ({
        id: crypto.randomUUID(),
        sale_id: id,
        product_id: line.productId,
        quantity: line.quantity,
        unit_price: line.unitPrice,
        line_total: line.unitPrice * line.quantity,
        created_at: now,
      })),
    );

    for (const line of input.lines) {
      const product = await db.products.get(line.productId);
      if (!product) continue;
      await db.products.update(line.productId, {
        stock_quantity: Math.max(product.stock_quantity - line.quantity, 0),
        updated_at: now,
      });
    }
  });

  void syncPendingSales();

  return sale;
}
