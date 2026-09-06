"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { isOwner } from "@/lib/auth/roles";
import {
  createGatewayPayment,
  verifyGatewayPayment,
  type GatewayPaymentMethod,
} from "@/lib/payments/gateway";

export interface StartSubscriptionPaymentInput {
  kind: "subscription" | "deposit";
  method: GatewayPaymentMethod;
  depositId?: string;
}

export type StartSubscriptionPaymentResult =
  | { paymentId: string; redirectUrl: string | null }
  | { error: string };

/**
 * Kreye yon tantativ peman ("subscription_payments", `status: "pending"`)
 * epi lanse li sou gateway Pay'm lan. Sèlman `owner` ka peye — se yon
 * aksyon finansye, kontrèman ak lekti abònman/tablèt ki louvri pou tout
 * moun nan boutik la.
 */
export async function startSubscriptionPayment(
  input: StartSubscriptionPaymentInput,
): Promise<StartSubscriptionPaymentResult> {
  const profile = await getCurrentProfile();
  if (!profile?.store_id || !isOwner(profile)) {
    return { error: "Ou pa gen dwa fè peman sa a." };
  }

  const supabase = await createClient();

  let amountHtg: number;
  let depositId: string | null = null;

  if (input.kind === "subscription") {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("price_htg")
      .eq("store_id", profile.store_id)
      .maybeSingle();
    if (!subscription?.price_htg) {
      return { error: "Boutik ou pa gen yon abònman ak yon pri konfigire." };
    }
    amountHtg = subscription.price_htg;
  } else {
    if (!input.depositId) {
      return { error: "Kosyon an pa idantifye." };
    }
    const { data: deposit } = await supabase
      .from("deposits")
      .select("amount_htg, amount_paid_htg, payment_mode, monthly_installment_htg")
      .eq("id", input.depositId)
      .eq("store_id", profile.store_id)
      .maybeSingle();
    if (!deposit) {
      return { error: "Nou pa t jwenn kosyon sa a." };
    }
    const remaining = deposit.amount_htg - deposit.amount_paid_htg;
    if (remaining <= 0) {
      return { error: "Kosyon sa a peye deja." };
    }
    amountHtg =
      deposit.payment_mode === "monthly_installment" && deposit.monthly_installment_htg
        ? Math.min(deposit.monthly_installment_htg, remaining)
        : remaining;
    depositId = input.depositId;
  }

  const { data: paymentRow, error: insertError } = await supabase
    .from("subscription_payments")
    .insert({
      store_id: profile.store_id,
      kind: input.kind,
      deposit_id: depositId,
      amount_htg: amountHtg,
      method: input.method,
    })
    .select("id")
    .single();

  if (insertError || !paymentRow) {
    return { error: "Nou pa t ka kreye tantativ peman an." };
  }

  const admin = createAdminClient();

  try {
    const { redirectUrl, transactionId } = await createGatewayPayment({
      referenceId: paymentRow.id,
      amountHtg,
      method: input.method,
    });
    await admin
      .from("subscription_payments")
      .update({ gateway_transaction_id: transactionId })
      .eq("id", paymentRow.id);
    return { paymentId: paymentRow.id, redirectUrl };
  } catch (error) {
    await admin.from("subscription_payments").update({ status: "failed" }).eq("id", paymentRow.id);
    return { error: error instanceof Error ? error.message : "Gateway peman an echwe." };
  }
}

export interface ConfirmSubscriptionPaymentResult {
  status: "pending" | "paid" | "failed";
  error?: string;
}

interface PaymentRow {
  id: string;
  store_id: string;
  kind: "subscription" | "deposit";
  deposit_id: string | null;
  amount_htg: number;
  method: GatewayPaymentMethod;
  status: "pending" | "paid" | "failed";
}

/**
 * Poll sou gateway a pou konfime yon tantativ peman. Yon fwa li konfime
 * `paid`, tout efè segondè yo (pwolonje abònman, ogmante kosyon peye,
 * ekri `platform_transactions`) pase pa `createAdminClient()` — menm
 * jistifikasyon ke yon webhook founisè peman ta genyen, jan
 * `src/lib/supabase/admin.ts` deja dokimante li — paske RLS pa janm
 * kite yon kòmèsan ekri dirèkteman nan `subscriptions`/`deposits`.
 */
export async function confirmSubscriptionPayment(
  paymentId: string,
): Promise<ConfirmSubscriptionPaymentResult> {
  const profile = await getCurrentProfile();
  if (!profile?.store_id) {
    return { status: "failed", error: "Ou pa gen aksè." };
  }

  const supabase = await createClient();
  const { data: payment } = await supabase
    .from("subscription_payments")
    .select("id, store_id, kind, deposit_id, amount_htg, method, status")
    .eq("id", paymentId)
    .eq("store_id", profile.store_id)
    .maybeSingle<PaymentRow>();

  if (!payment) {
    return { status: "failed", error: "Nou pa t jwenn peman sa a." };
  }
  if (payment.status === "paid") {
    return { status: "paid" };
  }
  if (payment.status === "failed") {
    return { status: "failed", error: "Peman sa a echwe." };
  }

  let verification;
  try {
    verification = await verifyGatewayPayment(payment.id);
  } catch {
    return { status: "pending" };
  }

  if (verification.outcome !== "paid") {
    return { status: "pending" };
  }

  const admin = createAdminClient();

  await admin
    .from("subscription_payments")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      gateway_transaction_id: verification.transactionId,
    })
    .eq("id", payment.id);

  if (payment.kind === "subscription") {
    const { data: subscription } = await admin
      .from("subscriptions")
      .select("id, current_period_end")
      .eq("store_id", payment.store_id)
      .maybeSingle();

    if (subscription) {
      const base =
        subscription.current_period_end && new Date(subscription.current_period_end) > new Date()
          ? new Date(subscription.current_period_end)
          : new Date();
      base.setMonth(base.getMonth() + 1);
      await admin
        .from("subscriptions")
        .update({ current_period_end: base.toISOString(), status: "active" })
        .eq("id", subscription.id);
    }

    await admin.from("platform_transactions").insert({
      type: "subscription_payment",
      store_id: payment.store_id,
      amount_htg: payment.amount_htg,
      method: payment.method,
      note: "Peman abònman via gateway Pay'm",
    });
  } else if (payment.deposit_id) {
    const { data: deposit } = await admin
      .from("deposits")
      .select("id, amount_htg, amount_paid_htg")
      .eq("id", payment.deposit_id)
      .maybeSingle();

    if (deposit) {
      const newPaid = deposit.amount_paid_htg + payment.amount_htg;
      await admin
        .from("deposits")
        .update({
          amount_paid_htg: newPaid,
          status: newPaid >= deposit.amount_htg ? "received" : "pending",
        })
        .eq("id", deposit.id);
    }

    await admin.from("platform_transactions").insert({
      type: "deposit_received",
      store_id: payment.store_id,
      amount_htg: payment.amount_htg,
      method: payment.method,
      note: "Peman kosyon tablèt via gateway Pay'm",
    });
  }

  return { status: "paid" };
}
