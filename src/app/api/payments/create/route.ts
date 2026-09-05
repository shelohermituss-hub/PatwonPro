import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createGatewayPayment, type GatewayPaymentMethod } from "@/lib/payments/gateway";
import { recordPaymentTransaction, updatePaymentTransactionStatus } from "@/lib/payments/audit";

const SUPPORTED_METHODS: GatewayPaymentMethod[] = ["moncash", "natcash"];

/**
 * Starts a MonCash or NatCash payment via the PLOP PLOP gateway (one
 * endpoint for both providers — see src/lib/payments/gateway.ts).
 * Returns a redirect URL the customer opens (via the QR code shown in
 * the POS) to complete payment on the provider's own page. The POS then
 * polls /api/payments/status/[id] for confirmation — the gateway has no
 * webhook.
 *
 * `payment_transactions.id` doubles as the gateway `refference_id` —
 * one id to track, no separate mapping table needed.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Ou dwe konekte." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("store_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.store_id) {
    return NextResponse.json({ error: "Nou pa jwenn boutik ou." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const amount = Number(body?.amount);
  const method = body?.method as GatewayPaymentMethod;

  if (!SUPPORTED_METHODS.includes(method)) {
    return NextResponse.json({ error: "Mwayen peman envalid." }, { status: 400 });
  }

  if (!Number.isFinite(amount) || amount < 20) {
    return NextResponse.json({ error: "Montan an dwe pi gwo pase 20 HTG." }, { status: 400 });
  }

  if (!process.env.PAYMENT_GATEWAY_CLIENT_ID) {
    console.error("[payments/create] PAYMENT_GATEWAY_CLIENT_ID pa konfigire.");
    return NextResponse.json(
      { error: "Peman mobil pa konfigire pou kounye a. Kontakte sipò." },
      { status: 503 },
    );
  }

  const transaction = await recordPaymentTransaction({
    storeId: profile.store_id,
    saleId: null,
    provider: method,
    providerReference: null,
    amount,
    status: "pending",
  });

  console.log("[payments/create] pending", {
    transactionId: transaction.id,
    method,
    amount,
    storeId: profile.store_id,
  });

  try {
    const { redirectUrl, transactionId } = await createGatewayPayment({
      referenceId: transaction.id,
      amountHtg: amount,
      method,
    });

    await updatePaymentTransactionStatus(transaction.id, "pending", transactionId);

    return NextResponse.json({ transactionId: transaction.id, redirectUrl });
  } catch (error) {
    console.error("[payments/create] gateway echwe", error);
    await updatePaymentTransactionStatus(transaction.id, "failed");
    return NextResponse.json(
      { error: "Nou pa t ka kreye peman an. Eseye ankò." },
      { status: 502 },
    );
  }
}
