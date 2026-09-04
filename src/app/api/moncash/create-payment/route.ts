import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createMonCashPayment } from "@/lib/payments/moncash";
import { recordPaymentTransaction, updatePaymentTransactionStatus } from "@/lib/payments/audit";

/**
 * Starts a MonCash payment for the given amount. Returns a redirect URL
 * the customer opens (via the QR code shown in the POS, on their own
 * phone — see src/components/pos/MonCashPaymentDialog.tsx) to complete
 * payment on MonCash's own gateway page. The POS then polls
 * /api/moncash/status/[id] for confirmation — MonCash's docs don't offer
 * a webhook (see src/lib/payments/moncash.ts).
 *
 * `payment_transactions.id` doubles as the MonCash `orderId` — one id to
 * track, no separate mapping table needed.
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

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Montan an envalid." }, { status: 400 });
  }

  if (!process.env.MONCASH_CLIENT_ID || !process.env.MONCASH_CLIENT_SECRET) {
    console.error("[moncash/create-payment] MONCASH_CLIENT_ID/SECRET pa konfigire.");
    return NextResponse.json(
      { error: "MonCash pa konfigire pou boutik sa a. Kontakte sipò." },
      { status: 503 },
    );
  }

  const transaction = await recordPaymentTransaction({
    storeId: profile.store_id,
    saleId: null,
    provider: "moncash",
    providerReference: null,
    amount,
    status: "pending",
  });

  console.log("[moncash/create-payment] pending", {
    transactionId: transaction.id,
    amount,
    storeId: profile.store_id,
  });

  try {
    const { redirectUrl } = await createMonCashPayment({
      orderId: transaction.id,
      amountHtg: amount,
    });

    return NextResponse.json({ transactionId: transaction.id, redirectUrl });
  } catch (error) {
    console.error("[moncash/create-payment] MonCash CreatePayment echwe", error);
    await updatePaymentTransactionStatus(transaction.id, "failed");
    return NextResponse.json(
      { error: "Nou pa t ka kreye peman MonCash lan. Eseye ankò." },
      { status: 502 },
    );
  }
}
