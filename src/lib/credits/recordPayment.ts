import { db } from "@/lib/db";
import { syncPendingCreditPayments } from "@/lib/sync/creditPayments";
import type { CreditPayment, PaymentMethod } from "@/types";

export interface RecordCreditPaymentInput {
  storeId: string;
  customerId: string;
  saleId: string;
  amount: number;
  paymentMethod: PaymentMethod;
}

/**
 * Records a repayment (partial or full) against a credit sale.
 * `customers.credit_balance` is intentionally left untouched here — the
 * `credit_payments_balance_insert` trigger applies it once this row
 * syncs (see createCredit.ts for the matching note on the debt side).
 */
export async function recordCreditPayment(
  input: RecordCreditPaymentInput,
): Promise<CreditPayment> {
  const payment: CreditPayment = {
    id: crypto.randomUUID(),
    store_id: input.storeId,
    customer_id: input.customerId,
    sale_id: input.saleId,
    amount: input.amount,
    payment_method: input.paymentMethod,
    sync_status: "pending",
    sync_attempts: 0,
    next_sync_at: null,
    created_at: new Date().toISOString(),
  };

  await db.creditPayments.add(payment);
  void syncPendingCreditPayments();

  return payment;
}
