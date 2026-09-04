import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Generic HMAC-SHA256 webhook signature check, shared by the MonCash and
 * NatCash webhook routes. Neither provider documents a real signature
 * scheme publicly (see src/lib/payments/moncash.ts and natcash.ts file
 * headers) — this verifies against a shared secret you configure
 * (`MONCASH_WEBHOOK_SECRET` / `NATCASH_WEBHOOK_SECRET`), matched against
 * an `x-webhook-signature` header, as a safe default. Replace the header
 * name/algorithm here with the provider's real scheme once you have it
 * from their merchant docs — until then, an unconfigured secret means
 * every webhook call is rejected rather than silently trusted.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string | undefined,
): boolean {
  if (!secret || !signatureHeader) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  const providedBuf = Buffer.from(signatureHeader, "utf8");

  if (expectedBuf.length !== providedBuf.length) return false;
  return timingSafeEqual(expectedBuf, providedBuf);
}
