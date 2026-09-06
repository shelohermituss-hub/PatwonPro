import type {
  SubscriptionPlan,
  SubscriptionStatus,
  DeviceStatus,
  SupportTicketStatus,
  DepositStatus,
  DepositPaymentMode,
} from "@/types";

export const SUBSCRIPTION_PLAN_LABELS: Record<SubscriptionPlan, string> = {
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
};

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  trialing: "Peryòd Eseyaj",
  active: "Aktif",
  past_due: "An Reta",
  canceled: "Anile",
  expired: "Ekspire",
  suspended: "Sispann",
};

export const DEVICE_STATUS_LABELS: Record<DeviceStatus, string> = {
  in_stock: "Nan Estòk",
  reserved: "Rezève",
  deployed_trial: "Deplwaye (Eseyaj)",
  deployed_active: "Deplwaye (Aktif)",
  repair: "An Reparasyon",
  returned: "Retounen",
  refurbished: "Refèt",
  lost: "Pèdi",
  retired: "Retire",
};

export const SUPPORT_TICKET_STATUS_LABELS: Record<SupportTicketStatus, string> = {
  open: "Louvri",
  in_progress: "An Kou",
  resolved: "Rezoud",
  closed: "Fèmen",
};

export const DEPOSIT_STATUS_LABELS: Record<DepositStatus, string> = {
  pending: "An Atant Peman",
  received: "Resevwa",
  held: "Kenbe",
  eligible_for_refund: "Elijib pou Ranbousman",
  refund_requested: "Ranbousman Mande",
  refunded: "Ranbouse",
  partially_retained: "Yon Pati Kenbe",
  fully_retained: "Tout Kenbe",
};

export const DEPOSIT_PAYMENT_MODE_LABELS: Record<DepositPaymentMode, string> = {
  lump_sum: "Yon sèl fwa",
  monthly_installment: "Mansyalite fiks",
};
