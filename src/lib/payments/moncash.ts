/**
 * MonCash (Digicel) REST API client. Credentials must only ever be read
 * server-side (route handler / server action) — never bundle
 * MONCASH_CLIENT_SECRET into client code.
 *
 * Endpoint shapes below (`payment_token.token`, `RetrieveOrderPayment`,
 * `RetrieveTransactionPayment`) are confirmed against a public MonCash SDK
 * (github.com/allyourdate-team/moncash-node.js) since MonCash's own docs
 * site returned 404 when this was last checked — re-verify against the
 * current sandbox before going live, in case the API has moved since.
 */

const MONCASH_BASE_URL =
  process.env.MONCASH_ENV === "production"
    ? "https://moncashbutton.digicelgroup.com/Api"
    : "https://sandbox.moncashbutton.digicelgroup.com/Api";

const MONCASH_REDIRECT_BASE =
  process.env.MONCASH_ENV === "production"
    ? "https://moncashbutton.digicelgroup.com/Moncash-middleware/Payment/Redirect"
    : "https://sandbox.moncashbutton.digicelgroup.com/Moncash-middleware/Payment/Redirect";

interface MonCashTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.MONCASH_CLIENT_ID;
  const clientSecret = process.env.MONCASH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("MONCASH_CLIENT_ID / MONCASH_CLIENT_SECRET pa konfigire.");
  }

  const response = await fetch(`${MONCASH_BASE_URL}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({ scope: "read,write", grant_type: "client_credentials" }),
  });

  if (!response.ok) {
    throw new Error(`MonCash token echwe: ${response.status}`);
  }

  const data = (await response.json()) as MonCashTokenResponse;
  return data.access_token;
}

export interface CreatePaymentParams {
  orderId: string;
  amountHtg: number;
}

interface MonCashCreatePaymentResponse {
  payment_token: {
    token: string;
    created: string;
    expired: string;
  };
  status: number;
}

/**
 * Creates a MonCash payment request and returns the redirect URL the
 * customer should be sent to, built from the response's `payment_token`
 * — a one-time payment token, distinct from the OAuth access token used
 * to authenticate the request.
 */
export async function createMonCashPayment({ orderId, amountHtg }: CreatePaymentParams) {
  const accessToken = await getAccessToken();

  const response = await fetch(`${MONCASH_BASE_URL}/v1/CreatePayment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ amount: amountHtg, orderId }),
  });

  if (!response.ok) {
    throw new Error(`MonCash CreatePayment echwe: ${response.status}`);
  }

  const data = (await response.json()) as MonCashCreatePaymentResponse;
  const paymentToken = data.payment_token?.token;

  if (!paymentToken) {
    throw new Error("MonCash CreatePayment pa retounen yon payment_token.");
  }

  return { redirectUrl: `${MONCASH_REDIRECT_BASE}?token=${paymentToken}` };
}

export interface MonCashPaymentStatus {
  reference: string;
  transactionId: string | null;
  cost: number;
  message: string | null;
  /**
   * Raw status text as returned by MonCash — do NOT infer "paid" from a
   * successful HTTP call alone. Exact status strings aren't confirmed
   * against live docs; treat anything other than an explicit success
   * marker as unresolved, and prefer the webhook (`07-payments.md`) as
   * the source of truth. This is the manual-recheck fallback described
   * there, not a replacement for it.
   */
  rawStatus: string;
}

/**
 * Looks up a payment by the `orderId` passed to `createMonCashPayment`.
 * Used for the manual "verifye estati peman" fallback in
 * `docs/PROMPTS/07-payments.md` when a webhook hasn't arrived — never as
 * the sole basis for marking a sale paid.
 */
export async function getMonCashPaymentStatus(orderId: string): Promise<MonCashPaymentStatus> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${MONCASH_BASE_URL}/v1/RetrieveOrderPayment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ orderId }),
  });

  if (!response.ok) {
    throw new Error(`MonCash RetrieveOrderPayment echwe: ${response.status}`);
  }

  const data = (await response.json()) as {
    payment: {
      reference: string;
      transaction_id: string | null;
      cost: number;
      message: string | null;
    };
    status: string;
  };

  return {
    reference: data.payment.reference,
    transactionId: data.payment.transaction_id,
    cost: data.payment.cost,
    message: data.payment.message,
    rawStatus: data.status,
  };
}
