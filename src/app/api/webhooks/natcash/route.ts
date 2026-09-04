import { NextResponse, type NextRequest } from "next/server";
import { verifyWebhookSignature } from "@/lib/payments/webhookAuth";
import { getPaymentTransaction, updatePaymentTransactionStatus } from "@/lib/payments/audit";

/**
 * NatCash payment webhook — built as requested (docs/PROMPTS/07-payments.md).
 * No public NatCash merchant API documentation exists at all (checked
 * during Phase 6 — see src/lib/payments/natcash.ts), so every field name
 * and the signature scheme below are **unverified guesses**, not a
 * confirmed contract. NatCash isn't wired into the POS checkout flow yet
 * for the same reason (docs/PROMPTS/07-payments.md) — this route exists
 * so the shape is ready, but treat it as inert until checked against
 * real Natcom merchant docs.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-webhook-signature");
  const verified = verifyWebhookSignature(rawBody, signature, process.env.NATCASH_WEBHOOK_SECRET);

  if (!verified) {
    console.warn("[webhooks/natcash] siyati envalid oswa pa konfigire — rejte");
    return NextResponse.json({ error: "Siyati envalid." }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as Record<string, unknown>;
  console.log("[webhooks/natcash] resevwa", payload);

  const orderId = typeof payload.orderId === "string" ? payload.orderId : null;
  if (!orderId) {
    console.warn("[webhooks/natcash] pa gen orderId nan payload la");
    return NextResponse.json({ ok: true });
  }

  const transaction = await getPaymentTransaction(orderId);
  if (!transaction) {
    console.warn("[webhooks/natcash] pa jwenn payment_transactions pou", orderId);
    return NextResponse.json({ ok: true });
  }

  const status = typeof payload.status === "string" ? payload.status : null;

  if (status === "successful" && transaction.status === "pending") {
    await updatePaymentTransactionStatus(
      transaction.id,
      "paid",
      typeof payload.paymentReference === "string" ? payload.paymentReference : null,
      payload,
    );
    console.log("[webhooks/natcash] konfime paid", { transactionId: transaction.id });
  }

  return NextResponse.json({ ok: true });
}
