const BASE_DELAY_MS = 5_000;
const MAX_DELAY_MS = 5 * 60_000;

/** Exponential backoff, capped, with jitter to avoid every tab retrying in lockstep. */
export function nextRetryDelay(attempts: number) {
  const delay = Math.min(BASE_DELAY_MS * 2 ** attempts, MAX_DELAY_MS);
  return delay + Math.random() * 1_000;
}

export const BACKGROUND_INTERVAL_MS = 20_000;
