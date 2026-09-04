import { createAdminClient } from "@/lib/supabase/admin";
import type { PaymentTransaction } from "@/types";

/**
 * Every call to a payment provider (create, status check, webhook
 * receipt) should have a corresponding row here — this table is the
 * audit trail for reconciliation and disputes. Uses the service-role
 * client since webhook deliveries have no user session to write as.
 */

export interface RecordPaymentTransactionInput {
  storeId: string;
  saleId: string | null;
  provider: PaymentTransaction["provider"];
  providerReference: string | null;
  amount: number;
  status?: PaymentTransaction["status"];
}

export async function recordPaymentTransaction(input: RecordPaymentTransactionInput) {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("payment_transactions")
    .insert({
      store_id: input.storeId,
      sale_id: input.saleId,
      provider: input.provider,
      provider_reference: input.providerReference,
      amount: input.amount,
      status: input.status ?? "pending",
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Pa t ka anrejistre payment_transactions: ${error.message}`);
  }

  return data as PaymentTransaction;
}

export async function updatePaymentTransactionStatus(
  id: string,
  status: PaymentTransaction["status"],
  providerReference?: string | null,
) {
  const admin = createAdminClient();

  const { error } = await admin
    .from("payment_transactions")
    .update({
      status,
      ...(providerReference !== undefined ? { provider_reference: providerReference } : {}),
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Pa t ka mete payment_transactions ajou: ${error.message}`);
  }
}
