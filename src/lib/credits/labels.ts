import type { CreditStatus } from "./status";

export const CREDIT_STATUS_LABELS: Record<CreditStatus, string> = {
  active: "Aktif",
  overdue: "An reta",
  paid: "Peye",
};
