const CURRENCY = new Intl.NumberFormat("fr-HT", {
  style: "currency",
  currency: "HTG",
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: number) {
  return CURRENCY.format(amount);
}

const NUMBER_GROUPED = new Intl.NumberFormat("fr-HT", { maximumFractionDigits: 0 });

/**
 * Same amount as formatCurrency(), but with an explicit "HTG" suffix
 * instead of Intl's HTG currency symbol (which resolves to "G", not
 * "HTG" — docs/CLAUDE.md's own example format is "12 500 HTG"). Kept
 * separate from formatCurrency() rather than changing it, since every
 * other screen already renders amounts with the "G" suffix.
 */
export function formatCurrencyHTG(amount: number) {
  return `${NUMBER_GROUPED.format(amount)} HTG`;
}

const DATE_TIME = new Intl.DateTimeFormat("fr-HT", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDateTime(iso: string) {
  return DATE_TIME.format(new Date(iso));
}
