const CURRENCY = new Intl.NumberFormat("fr-HT", {
  style: "currency",
  currency: "HTG",
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: number) {
  return CURRENCY.format(amount);
}

const DATE_TIME = new Intl.DateTimeFormat("fr-HT", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDateTime(iso: string) {
  return DATE_TIME.format(new Date(iso));
}
