import { NextResponse, type NextRequest } from "next/server";
import { verifyWebhookSignature } from "@/lib/payments/webhookAuth";
import { getPaymentTransaction, updatePaymentTransactionStatus } from "@/lib/payments/audit";
import { mapMonCashStatus } from "@/lib/payments/moncash";

/**
 * MonCash payment webhook — built as requested (docs/PROMPTS/07-payments.md),
 * but Digicel's official REST API documentation has no webhook/IPN/callback
 * section at all (verified during Phase 6 — see src/lib/payments/moncash.ts).
 * This route may never actually receive traffic; the POS's real
 * confirmation path is polling /api/moncash/status/[id]. Keep this as a
 * defensive fallback in case Digicel enables server-to-server
 * notifications for a specific merchant account that aren't in the
 * public docs — do not rely on it being called.
 *
 * The payload shape below (`transactionId`/`orderId`, `message`) is a
 * best guess mirroring the REST API's own field names, not a confirmed
 * contract — update it once/if real webhook docs are available.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-webhook-signature");
  const verified = verifyWebhookSignature(rawBody, signature, process.env.MONCASH_WEBHOOK_SECRET);

  if (!verified) {
    console.warn("[webhooks/moncash] siyati envalid oswa pa konfigire — rejte");
    return NextResponse.json({ error: "Siyati envalid." }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as Record<string, unknown>;
  console.log("[webhooks/moncash] resevwa", payload);

  const orderId =
    typeof payload.orderId === "string"
      ? payload.orderId
      : typeof payload.transactionId === "string"
        ? payload.transactionId
        : null;

  if (!orderId) {
    console.warn("[webhooks/moncash] pa gen orderId/transactionId nan payload la");
    return NextResponse.json({ ok: true });
  }

  const transaction = await getPaymentTransaction(orderId);
  if (!transaction) {
    console.warn("[webhooks/moncash] pa jwenn payment_transactions pou", orderId);
    return NextResponse.json({ ok: true });
  }

  const message = typeof payload.message === "string" ? payload.message : null;
  const outcome = mapMonCashStatus(message);

  if (outcome === "paid" && transaction.status === "pending") {
    await updatePaymentTransactionStatus(
      transaction.id,
      "paid",
      typeof payload.transaction_id === "string" ? payload.transaction_id : null,
      payload,
    );
    console.log("[webhooks/moncash] konfime paid", { transactionId: transaction.id });
  }

  return NextResponse.json({ ok: true });
}
