import type { PaymentMethod, PaymentStatus } from "@/types";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Kach",
  moncash: "MonCash",
  natcash: "NatCash",
  credit: "Kredi",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: "Peye",
  partial: "Pasyèl",
  credit: "Kredi",
};
