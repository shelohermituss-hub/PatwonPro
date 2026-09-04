/** Days of no repayment before an unpaid credit is flagged overdue (docs/PROMPTS/05-credits.md). */
export const OVERDUE_DAYS = 30;

export type CreditStatus = "active" | "overdue" | "paid";

export function computeCreditStatus(remaining: number, createdAt: string): CreditStatus {
  if (remaining <= 0) return "paid";
  const ageDays = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return ageDays > OVERDUE_DAYS ? "overdue" : "active";
}
