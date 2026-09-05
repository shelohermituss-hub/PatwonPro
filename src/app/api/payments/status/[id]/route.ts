import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyGatewayPayment } from "@/lib/payments/gateway";
import {
  getPaymentTransaction,
  updatePaymentTransactionStatus,
  linkPaymentTransactionToSale,
} from "@/lib/payments/audit";

async function requireStoreId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("store_id")
    .eq("id", user.id)
    .maybeSingle();

  return profile?.store_id ?? null;
}

/**
 * Polls the gateway for the current status of a payment. This is the
 * sole confirmation mechanism (no webhook — see
 * src/lib/payments/gateway.ts), called every few seconds by
 * usePaymentGateway.ts while a payment is in flight, plus once more for
 * a manual "Verifye kounye a" recheck.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const storeId = await requireStoreId();
  if (!storeId) {
    return NextResponse.json({ error: "Ou dwe konekte." }, { status: 401 });
  }

  const { id } = await params;
  const transaction = await getPaymentTransaction(id);

  if (!transaction || transaction.store_id !== storeId) {
    return NextResponse.json({ error: "Nou pa jwenn tranzaksyon sa a." }, { status: 404 });
  }

  if (transaction.status !== "pending") {
    return NextResponse.json({ status: transaction.status });
  }

  try {
    const result = await verifyGatewayPayment(id);

    console.log("[payments/status] checked", {
      transactionId: id,
      transStatus: result.raw.trans_status,
      outcome: result.outcome,
    });

    if (result.outcome === "paid") {
      await updatePaymentTransactionStatus(
        id,
        "paid",
        result.transactionId,
        result.raw as unknown as Record<string, unknown>,
      );
      return NextResponse.json({ status: "paid" });
    }

    return NextResponse.json({ status: "pending" });
  } catch (error) {
    // A transient failure while polling means "still pending", never a
    // hard failure — the next poll (or a manual recheck) will retry.
    console.warn("[payments/status] verifikasyon pa reyisi, rete pending", {
      transactionId: id,
      error,
    });
    return NextResponse.json({ status: "pending" });
  }
}

/**
 * `{action: "cancel"}` — the cashier closed the payment dialog before it
 * resolved. `{action: "link-sale", saleId}` — the POS confirmed the
 * payment and created the local Sale; ties the audit row to it.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const storeId = await requireStoreId();
  if (!storeId) {
    return NextResponse.json({ error: "Ou dwe konekte." }, { status: 401 });
  }

  const { id } = await params;
  const transaction = await getPaymentTransaction(id);

  if (!transaction || transaction.store_id !== storeId) {
    return NextResponse.json({ error: "Nou pa jwenn tranzaksyon sa a." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);

  if (body?.action === "cancel") {
    if (transaction.status === "pending") {
      await updatePaymentTransactionStatus(id, "cancelled");
      console.log("[payments/status] anile pa kesye a", { transactionId: id });
    }
    return NextResponse.json({ status: "cancelled" });
  }

  if (body?.action === "link-sale" && typeof body.saleId === "string") {
    await linkPaymentTransactionToSale(id, body.saleId);
    console.log("[payments/status] mare ak vant", { transactionId: id, saleId: body.saleId });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Aksyon envalid." }, { status: 400 });
}
