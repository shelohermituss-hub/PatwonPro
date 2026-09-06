import { createAdminClient } from "@/lib/supabase/admin";
import type { PaymentTransaction } from "@/types";

/**
 * `payment_transactions` audit-trail helpers for the Pay'm PLOP PLOP
 * gateway (`src/lib/payments/gateway.ts`). Not currently called from
 * anywhere — POS MonCash/NatCash payments moved to a manual
 * store-configured QR/phone confirmation (no gateway call at all, see
 * `src/components/pos/MobilePaymentConfirmDialog.tsx`). Kept for the
 * gateway's real remaining use: a store paying its own Jere Boutik
 * subscription (`platform_settings.payment_gateway_client_id`) — a
 * future route can reuse these to record/track that payment. Uses the
 * service-role client since there's no user session guaranteed at the
 * point a gateway status changes.
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
  rawEvent?: Record<string, unknown>,
) {
  const admin = createAdminClient();

  const { error } = await admin
    .from("payment_transactions")
    .update({
      status,
      ...(providerReference !== undefined ? { provider_reference: providerReference } : {}),
      ...(rawEvent !== undefined ? { raw_event: rawEvent } : {}),
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Pa t ka mete payment_transactions ajou: ${error.message}`);
  }
}

export async function linkPaymentTransactionToSale(id: string, saleId: string) {
  const admin = createAdminClient();

  const { error } = await admin.from("payment_transactions").update({ sale_id: saleId }).eq("id", id);

  if (error) {
    throw new Error(`Pa t ka mare payment_transactions ak vant lan: ${error.message}`);
  }
}

export async function getPaymentTransaction(id: string): Promise<PaymentTransaction | null> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("payment_transactions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Pa t ka jwenn payment_transactions: ${error.message}`);
  }

  return data as PaymentTransaction | null;
}
