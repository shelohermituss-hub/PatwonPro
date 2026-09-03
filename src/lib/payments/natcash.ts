/**
 * NatCash (Natcom) payment client. Same server-only rule as MonCash:
 * NATCASH_CLIENT_SECRET must never reach the browser bundle.
 *
 * NatCash's public API surface is more limited than MonCash's; this client
 * is intentionally thin and should be filled in against the merchant
 * integration docs Natcom provides once a merchant account is issued.
 */

const NATCASH_BASE_URL =
  process.env.NATCASH_ENV === "production"
    ? "https://api.natcash.digicelgroup.com"
    : "https://sandbox-api.natcash.digicelgroup.com";

export interface CreatePaymentParams {
  orderId: string;
  amountHtg: number;
  customerPhone: string;
}

export async function createNatCashPayment({
  orderId,
  amountHtg,
  customerPhone,
}: CreatePaymentParams) {
  const clientId = process.env.NATCASH_CLIENT_ID;
  const clientSecret = process.env.NATCASH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("NATCASH_CLIENT_ID / NATCASH_CLIENT_SECRET pa konfigire.");
  }

  const response = await fetch(`${NATCASH_BASE_URL}/v1/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Client-Id": clientId,
      "X-Client-Secret": clientSecret,
    },
    body: JSON.stringify({ orderId, amount: amountHtg, phone: customerPhone }),
  });

  if (!response.ok) {
    throw new Error(`NatCash payment echwe: ${response.status}`);
  }

  return (await response.json()) as { paymentReference: string; status: string };
}
