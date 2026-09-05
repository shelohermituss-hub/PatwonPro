import type {
  AdminSubscriptionStatus,
  AdminSupportStatus,
  DepositStatus,
  DeviceStatusAdmin,
  InstallationStatus,
  LeadStage,
  StoreSubscriptionStatus,
  SupportCategory,
  SupportPriority,
} from "@/types/admin";

export type StatusTone = "neutral" | "positive" | "warning" | "negative" | "info";

interface StatusMeta {
  label: string;
  tone: StatusTone;
}

export const STORE_STATUS_LABELS: Record<StoreSubscriptionStatus, StatusMeta> = {
  trial: { label: "An Esè", tone: "info" },
  active: { label: "Aktif", tone: "positive" },
  overdue: { label: "An Reta", tone: "warning" },
  suspended: { label: "Sispann", tone: "negative" },
  closed: { label: "Klotire", tone: "neutral" },
};

export const SUBSCRIPTION_STATUS_LABELS: Record<AdminSubscriptionStatus, StatusMeta> = {
  trial: { label: "An Esè", tone: "info" },
  active: { label: "Aktif", tone: "positive" },
  grace_period: { label: "Delè Gras", tone: "warning" },
  overdue: { label: "An Reta", tone: "warning" },
  suspended: { label: "Sispann", tone: "negative" },
  cancelled: { label: "Anile", tone: "neutral" },
};

export const DEPOSIT_STATUS_LABELS: Record<DepositStatus, StatusMeta> = {
  received: { label: "Resevwa", tone: "info" },
  held: { label: "Kenbe", tone: "neutral" },
  eligible_for_refund: { label: "Elijib Ranbousman", tone: "positive" },
  refund_requested: { label: "Ranbousman Mande", tone: "warning" },
  refunded: { label: "Ranbouse", tone: "positive" },
  partially_retained: { label: "Retni Pasyèlman", tone: "warning" },
  fully_retained: { label: "Retni Antye", tone: "negative" },
};

export const DEVICE_STATUS_LABELS: Record<DeviceStatusAdmin, StatusMeta> = {
  in_stock: { label: "An Estòk", tone: "info" },
  reserved: { label: "Rezève", tone: "neutral" },
  deployed_trial: { label: "Deplwaye (Esè)", tone: "info" },
  deployed_active: { label: "Deplwaye (Aktif)", tone: "positive" },
  repair: { label: "An Reparasyon", tone: "warning" },
  returned: { label: "Retounen", tone: "neutral" },
  refurbished: { label: "Rekondisyone", tone: "positive" },
  lost: { label: "Pèdi", tone: "negative" },
  retired: { label: "Retire", tone: "neutral" },
};

export const INSTALLATION_STATUS_LABELS: Record<InstallationStatus, StatusMeta> = {
  scheduled: { label: "Planifye", tone: "info" },
  en_route: { label: "An Wout", tone: "info" },
  installed: { label: "Enstale", tone: "positive" },
  postponed: { label: "Ranvwaye", tone: "warning" },
  cancelled: { label: "Anile", tone: "negative" },
};

export const SUPPORT_STATUS_LABELS: Record<AdminSupportStatus, StatusMeta> = {
  new: { label: "Nouvo", tone: "info" },
  in_progress: { label: "An Kou", tone: "warning" },
  waiting_customer: { label: "Ap Tann Kliyan", tone: "neutral" },
  resolved: { label: "Rezoud", tone: "positive" },
};

export const SUPPORT_PRIORITY_LABELS: Record<SupportPriority, StatusMeta> = {
  P1: { label: "P1 · Ijan", tone: "negative" },
  P2: { label: "P2 · Enpòtan", tone: "warning" },
  P3: { label: "P3 · Nòmal", tone: "info" },
  P4: { label: "P4 · Backlog", tone: "neutral" },
};

export const SUPPORT_CATEGORY_LABELS: Record<SupportCategory, string> = {
  training: "Fòmasyon",
  products_stock: "Pwodwi ak Stòk",
  pos_sale: "Vant / Kès",
  customer_credit: "Kredi Kliyan",
  device_hardware: "Tablèt / Chajè / Ekran",
  connectivity_sync: "Koneksyon / Senkwonizasyon",
  moncash_natcash: "MonCash / NatCash",
  subscription: "Abònman",
  feature_suggestion: "Sijesyon Pwodwi",
};

export const LEAD_STAGE_LABELS: Record<LeadStage, StatusMeta> = {
  lead: { label: "Lead", tone: "neutral" },
  contacted: { label: "Kontakte", tone: "info" },
  demo_scheduled: { label: "Demo Planifye", tone: "info" },
  demo_done: { label: "Demo Fèt", tone: "info" },
  trial_installed: { label: "Esè Enstale", tone: "warning" },
  trial_active: { label: "Esè Aktif", tone: "warning" },
  converted: { label: "Konvèti", tone: "positive" },
  lost: { label: "Pèdi", tone: "negative" },
  device_recovered: { label: "Tablèt Rekipere", tone: "neutral" },
};
