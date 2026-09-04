import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createNatCashPayment } from "@/lib/payments/natcash";
import { recordPaymentTransaction, updatePaymentTransactionStatus } from "@/lib/payments/audit";

/**
 * Mirrors /api/moncash/create-payment's shape per docs/PROMPTS/07-payments.md,
 * but src/lib/payments/natcash.ts is built on guessed field names — no
 * public NatCash merchant API documentation exists. This route is not
 * called by the POS UI yet (it shows "pa disponib" for NatCash instead —
 * see src/components/pos/CartPanel.tsx); it's here so the integration is
 * structurally ready once real Natcom merchant docs/credentials exist,
 * not because it's expected to work today.
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
  const customerPhone = typeof body?.customerPhone === "string" ? body.customerPhone : "";

  if (!Number.isFinite(amount) || amount <= 0 || !customerPhone) {
    return NextResponse.json({ error: "Done envalid." }, { status: 400 });
  }

  if (!process.env.NATCASH_CLIENT_ID || !process.env.NATCASH_CLIENT_SECRET) {
    console.error("[natcash/create-payment] NATCASH_CLIENT_ID/SECRET pa konfigire.");
    return NextResponse.json(
      { error: "NatCash pa disponib kounye a." },
      { status: 503 },
    );
  }

  const transaction = await recordPaymentTransaction({
    storeId: profile.store_id,
    saleId: null,
    provider: "natcash",
    providerReference: null,
    amount,
    status: "pending",
  });

  console.log("[natcash/create-payment] pending", {
    transactionId: transaction.id,
    amount,
    storeId: profile.store_id,
  });

  try {
    const result = await createNatCashPayment({
      orderId: transaction.id,
      amountHtg: amount,
      customerPhone,
    });

    return NextResponse.json({ transactionId: transaction.id, paymentReference: result.paymentReference });
  } catch (error) {
    console.error("[natcash/create-payment] NatCash payment echwe", error);
    await updatePaymentTransactionStatus(transaction.id, "failed");
    return NextResponse.json(
      { error: "Nou pa t ka kreye peman NatCash lan." },
      { status: 502 },
    );
  }
}
