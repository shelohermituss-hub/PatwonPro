/**
 * MonCash (Digicel) REST API client. Credentials must only ever be read
 * server-side (route handler / server action) — never bundle
 * MONCASH_CLIENT_SECRET into client code.
 *
 * Docs: https://sandbox.moncashbutton.digicelgroup.com/Moncash-business/document
 */

const MONCASH_BASE_URL =
  process.env.MONCASH_ENV === "production"
    ? "https://moncashbutton.digicelgroup.com/Api"
    : "https://sandbox.moncashbutton.digicelgroup.com/Api";

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

/**
 * Creates a MonCash payment request and returns the redirect URL the
 * customer should be sent to (or the deep link, for the in-app flow).
 */
export async function createMonCashPayment({ orderId, amountHtg }: CreatePaymentParams) {
  const token = await getAccessToken();

  const response = await fetch(`${MONCASH_BASE_URL}/v1/CreatePayment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount: amountHtg, orderId }),
  });

  if (!response.ok) {
    throw new Error(`MonCash CreatePayment echwe: ${response.status}`);
  }

  const redirectBase =
    process.env.MONCASH_ENV === "production"
      ? "https://moncashbutton.digicelgroup.com/Moncash-middleware/Payment/Redirect"
      : "https://sandbox.moncashbutton.digicelgroup.com/Moncash-middleware/Payment/Redirect";

  return { redirectUrl: `${redirectBase}?token=${token}` };
}
