/**
 * MonCash (Digicel) REST API client. Credentials must only ever be read
 * server-side (route handler / server action) — never bundle
 * MONCASH_CLIENT_SECRET into client code.
 *
 * Endpoint shapes below are verified directly against Digicel's own
 * official PDF ("Rest API MonCash Documentation", © 2019 Digicel),
 * fetched from sandbox.moncashbutton.digicelgroup.com/Moncash-business/
 * resources/doc/RestAPI_MonCash_doc.pdf during Phase 6 (docs/PROMPTS/07-payments.md).
 * That document has **no webhook/IPN/callback section** — MonCash's only
 * documented confirmation mechanisms are (1) a redirect back to a
 * merchant-configured return URL, and (2) polling
 * RetrieveOrderPayment/RetrieveTransactionPayment. The sync engine here
 * treats polling as the primary confirmation path accordingly; see
 * src/app/api/webhooks/moncash/route.ts for why that route exists anyway.
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
  /**
   * The actual payment outcome field per Digicel's docs — confirmed
   * example value is `"successful"`. Everything else (other strings, or
   * this lookup returning a 404 because MonCash has no record of the
   * order yet) means the payment is not confirmed; the doc doesn't
   * enumerate a full vocabulary (no documented "pending"/"failed"
   * strings for this endpoint specifically), so `mapMonCashStatus`
   * below only asserts "paid" vs "not confirmed yet", never "failed".
   */
  message: string | null;
}

export type MonCashPaymentOutcome = "paid" | "unresolved";

/** Only `message === "successful"` (the one value Digicel's docs confirm) counts as paid. */
export function mapMonCashStatus(message: string | null): MonCashPaymentOutcome {
  return message === "successful" ? "paid" : "unresolved";
}

/**
 * Looks up a payment by the `orderId` passed to `createMonCashPayment`.
 * This is the primary confirmation path (see file header — MonCash's
 * docs don't offer a webhook), used both for the POS's status-polling
 * and for manual "verifye estati peman" reconciliation.
 *
 * Throws on a non-2xx response (including 404 "no such order yet",
 * which is expected while a payment is still in flight) — callers
 * should treat a thrown error the same as `mapMonCashStatus` returning
 * `"unresolved"`, not as a hard failure.
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
    status: number;
  };

  return {
    reference: data.payment.reference,
    transactionId: data.payment.transaction_id,
    cost: data.payment.cost,
    message: data.payment.message,
  };
}
