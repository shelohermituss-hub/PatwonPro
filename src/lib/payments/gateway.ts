/**
 * Client for the "PLOP PLOP" merchant payment gateway
 * (API Paiement & Retrait Marchand v1.4, base URL
 * https://plopplop.solutionip.app/) — the real, documented API behind
 * both MonCash and NatCash in this app. One unified endpoint creates a
 * payment for either provider (`payment_method: "moncash" | "natcash"`)
 * and one unified endpoint verifies it, so a single client file covers
 * both — there is no separate MonCash-specific or NatCash-specific
 * contract the way there was with MonCash's own direct Digicel API.
 *
 * `PAYMENT_GATEWAY_CLIENT_ID` must only ever be read server-side (route
 * handler) — never bundle it into client code. Payment creation itself
 * needs only the client_id (no secret), per the documented contract;
 * the gateway's separate merchant *withdrawal* API (client_secret +
 * HMAC-signed tokens) is a distinct capability, not implemented here.
 */

const GATEWAY_BASE_URL = "https://plopplop.solutionip.app";
const MIN_AMOUNT_HTG = 20;

export type GatewayPaymentMethod = "moncash" | "natcash";

function requireClientId(): string {
  const clientId = process.env.PAYMENT_GATEWAY_CLIENT_ID;
  if (!clientId) {
    throw new Error("PAYMENT_GATEWAY_CLIENT_ID pa konfigire.");
  }
  return clientId;
}

export interface CreateGatewayPaymentParams {
  referenceId: string;
  amountHtg: number;
  method: GatewayPaymentMethod;
}

interface GatewayCreatePaymentResponse {
  status: boolean;
  message: string;
  url: string | null;
  transaction_id: string;
}

/**
 * Creates a payment on the gateway and returns the redirect URL the
 * customer opens to complete it on MonCash's/NatCash's own page — via
 * the QR code shown in the POS (src/components/pos/PaymentGatewayDialog.tsx).
 * `referenceId` must be unique (the gateway rejects a reused one with
 * 409) — callers pass their own `payment_transactions.id`.
 */
export async function createGatewayPayment({
  referenceId,
  amountHtg,
  method,
}: CreateGatewayPaymentParams): Promise<{ redirectUrl: string | null; transactionId: string }> {
  if (amountHtg < MIN_AMOUNT_HTG) {
    throw new Error(`Montan an dwe pi gwo pase ${MIN_AMOUNT_HTG} HTG.`);
  }

  const response = await fetch(`${GATEWAY_BASE_URL}/api/paiement-marchand`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: requireClientId(),
      refference_id: referenceId,
      montant: amountHtg,
      payment_method: method,
    }),
  });

  const data = (await response.json().catch(() => null)) as GatewayCreatePaymentResponse | null;

  if (!response.ok || !data?.status) {
    throw new Error(data?.message ?? `Gateway paiement-marchand echwe: ${response.status}`);
  }

  return { redirectUrl: data.url, transactionId: data.transaction_id };
}

export type GatewayPaymentOutcome = "paid" | "unresolved";

interface GatewayVerifyResponse {
  status: boolean;
  message: string;
  montant: number;
  /** `"no"` = en attente, `"ok"` = confirmé — the only two documented values. */
  trans_status: "no" | "ok";
  id_transaction: string;
  date: string;
  heure: string;
  method: string;
  id_client: string | null;
}

export function mapGatewayStatus(transStatus: string): GatewayPaymentOutcome {
  return transStatus === "ok" ? "paid" : "unresolved";
}

export interface GatewayPaymentStatus {
  outcome: GatewayPaymentOutcome;
  transactionId: string;
  amount: number;
  method: string;
  raw: GatewayVerifyResponse;
}

/**
 * Looks up a payment by the `referenceId` passed to `createGatewayPayment`.
 * This is the sole confirmation path — the documentation has no
 * webhook/IPN section — so callers poll this on an interval, exactly as
 * MonCash's own direct API required before.
 */
export async function verifyGatewayPayment(referenceId: string): Promise<GatewayPaymentStatus> {
  const response = await fetch(`${GATEWAY_BASE_URL}/api/paiement-verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: requireClientId(),
      refference_id: referenceId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Gateway paiement-verify echwe: ${response.status}`);
  }

  const data = (await response.json()) as GatewayVerifyResponse;

  return {
    outcome: mapGatewayStatus(data.trans_status),
    transactionId: data.id_transaction,
    amount: data.montant,
    method: data.method,
    raw: data,
  };
}
