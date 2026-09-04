import { db } from "@/lib/db";
import { syncPendingSales } from "@/lib/sync/sales";
import type { Sale } from "@/types";

export interface CreateCreditInput {
  storeId: string;
  employeeId: string;
  customerId: string;
  amount: number;
}

/**
 * Records a manual credit debt (e.g. "Jean pran 500 goud kredi" with no
 * itemized products) as a `Sale` with no line items — the same shape a
 * POS credit sale produces, so both show up together in /credits.
 * `customers.credit_balance` is intentionally left untouched here: the
 * `sales_credit_balance_insert` trigger (see the migration) applies it
 * once this row syncs, so every credit-creation path (POS, this form,
 * a retried sync) stays consistent without duplicating that logic.
 */
export async function createCredit(input: CreateCreditInput): Promise<Sale> {
  const now = new Date().toISOString();

  const sale: Sale = {
    id: crypto.randomUUID(),
    store_id: input.storeId,
    employee_id: input.employeeId,
    customer_id: input.customerId,
    subtotal: input.amount,
    discount: 0,
    total: input.amount,
    payment_method: "credit",
    payment_status: "credit",
    sync_status: "pending",
    sync_attempts: 0,
    next_sync_at: null,
    created_at: now,
    updated_at: now,
  };

  await db.sales.add(sale);
  void syncPendingSales();

  return sale;
}
