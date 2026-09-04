/**
 * NatCash (Natcom) payment client. Same server-only rule as MonCash:
 * NATCASH_CLIENT_SECRET must never reach the browser bundle.
 *
 * Unlike MonCash, no public NatCash merchant API documentation could be
 * found (checked: Natcom's own sites and a general search turned up
 * nothing). Every field/path/header name below is a **placeholder
 * guess** based on typical mobile-money REST APIs, not a verified
 * contract — do not treat this file as correct until it's checked
 * against the real merchant integration docs Natcom provides once a
 * merchant account is issued. Update this comment once verified.
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

export interface NatCashPaymentResult {
  paymentReference: string;
  status: string;
}

export async function createNatCashPayment({
  orderId,
  amountHtg,
  customerPhone,
}: CreatePaymentParams): Promise<NatCashPaymentResult> {
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

  return (await response.json()) as NatCashPaymentResult;
}

/**
 * Looks up a payment's status by the reference `createNatCashPayment`
 * returned. Placeholder shape (see file header) — never treat a
 * "success"-looking `rawStatus` here as final without cross-checking the
 * real docs' status vocabulary once available.
 */
export async function getNatCashPaymentStatus(paymentReference: string): Promise<{
  paymentReference: string;
  rawStatus: string;
}> {
  const clientId = process.env.NATCASH_CLIENT_ID;
  const clientSecret = process.env.NATCASH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("NATCASH_CLIENT_ID / NATCASH_CLIENT_SECRET pa konfigire.");
  }

  const response = await fetch(
    `${NATCASH_BASE_URL}/v1/payments/${encodeURIComponent(paymentReference)}`,
    {
      headers: {
        "X-Client-Id": clientId,
        "X-Client-Secret": clientSecret,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`NatCash lookup echwe: ${response.status}`);
  }

  const data = (await response.json()) as { status: string };
  return { paymentReference, rawStatus: data.status };
}
