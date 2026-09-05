/**
 * Domain types for the internal Jere Boutik Admin back-office
 * (`/admin`) — entirely separate from the merchant-facing `Profile`/
 * `UserRole` model in `src/types/index.ts`. This phase is UI + mock
 * data only (see docs/ADMIN_DASHBOARD_ARCHITECTURE.md): `AdminDevice`,
 * `AdminSubscription` and `AdminSupportTicket` are richer versions of
 * the real `devices`/`subscriptions`/`support_tickets` tables — a
 * future backend phase should extend those tables, not duplicate them.
 * Everything else here (leads, deposits, installations, sync, audit,
 * team) has no real table yet.
 */

export type AdminRole =
  | "super_admin"
  | "operations_manager"
  | "sales_agent"
  | "field_agent"
  | "support_agent"
  | "finance_agent"
  | "read_only";

export interface AdminActor {
  id: string;
  name: string;
  role: AdminRole;
}

export type StoreSubscriptionStatus = "trial" | "active" | "overdue" | "suspended" | "closed";

export interface AdminStore {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  whatsapp: string;
  city: string;
  zone: string;
  quarter: string;
  businessType: string;
  subscriptionStatus: StoreSubscriptionStatus;
  plan: "starter" | "standard" | "pro";
  monthlyPriceHtg: number;
  nextDueDate: string | null;
  daysLate: number;
  lastSaleAt: string | null;
  lastSyncAt: string | null;
  deviceId: string | null;
  agentName: string;
  installedAt: string | null;
  usesMonCash: boolean;
  usesNatCash: boolean;
}

export type LeadStage =
  | "lead"
  | "contacted"
  | "demo_scheduled"
  | "demo_done"
  | "trial_installed"
  | "trial_active"
  | "converted"
  | "lost"
  | "device_recovered";

export interface Lead {
  id: string;
  storeName: string;
  ownerName: string;
  phone: string;
  whatsapp: string;
  address: string;
  zone: string;
  businessType: string;
  estimatedProductCount: number;
  sellerCount: number;
  usesMobileMoney: boolean;
  agentName: string;
  deviceId: string | null;
  trialStartDate: string | null;
  trialEndDate: string | null;
  lastInteractionAt: string;
  objections: string | null;
  lossReason: string | null;
  stage: LeadStage;
}

export type AdminSubscriptionStatus =
  | "trial"
  | "active"
  | "grace_period"
  | "overdue"
  | "suspended"
  | "cancelled";

export interface AdminSubscription {
  id: string;
  storeId: string;
  storeName: string;
  plan: "starter" | "standard" | "pro";
  monthlyPriceHtg: number;
  status: AdminSubscriptionStatus;
  startDate: string;
  nextDueDate: string;
  lastPaymentDate: string | null;
  amountDueHtg: number;
  daysLate: number;
  collectionAgent: string;
  lastReminderAt: string | null;
  recommendedAction: string;
}

export type DepositStatus =
  | "received"
  | "held"
  | "eligible_for_refund"
  | "refund_requested"
  | "refunded"
  | "partially_retained"
  | "fully_retained";

export interface Deposit {
  id: string;
  storeId: string;
  storeName: string;
  contractNumber: string;
  deviceId: string;
  amountHtg: number;
  receivedDate: string;
  status: DepositStatus;
  eligibleRefundDate: string | null;
  deviceCondition: string | null;
  amountToReturnHtg: number | null;
  amountRetainedHtg: number | null;
  retentionReason: string | null;
  refundProofUrl: string | null;
  financeAgent: string;
}

export type DeviceStatusAdmin =
  | "in_stock"
  | "reserved"
  | "deployed_trial"
  | "deployed_active"
  | "repair"
  | "returned"
  | "refurbished"
  | "lost"
  | "retired";

export interface DeviceRepairEntry {
  date: string;
  issue: string;
  cost: number;
}

export interface AdminDevice {
  id: string;
  serialNumber: string;
  brand: string;
  model: string;
  importBatch: string;
  actualCostHtg: number;
  purchaseDate: string;
  status: DeviceStatusAdmin;
  assignedStoreId: string | null;
  assignedStoreName: string | null;
  contractNumber: string | null;
  depositId: string | null;
  lastSyncAt: string | null;
  repairHistory: DeviceRepairEntry[];
  photoCount: number;
  installedAt: string | null;
  returnedAt: string | null;
}

export type InstallationStatus = "scheduled" | "en_route" | "installed" | "postponed" | "cancelled";

export interface InstallationChecklistItem {
  label: string;
  done: boolean;
}

export interface Installation {
  id: string;
  storeId: string | null;
  storeName: string;
  contact: string;
  address: string;
  timeSlot: string;
  agentName: string;
  deviceId: string | null;
  status: InstallationStatus;
  productsToImport: number;
  checklist: InstallationChecklistItem[];
  photoCount: number;
  clientSignature: boolean;
  trainingResult: string | null;
  nextAction: string;
}

export type SupportCategory =
  | "training"
  | "products_stock"
  | "pos_sale"
  | "customer_credit"
  | "device_hardware"
  | "connectivity_sync"
  | "moncash_natcash"
  | "subscription"
  | "feature_suggestion";

export type SupportPriority = "P1" | "P2" | "P3" | "P4";

export type AdminSupportStatus = "new" | "in_progress" | "waiting_customer" | "resolved";

export interface AdminSupportTicket {
  id: string;
  storeId: string;
  storeName: string;
  subject: string;
  category: SupportCategory;
  priority: SupportPriority;
  status: AdminSupportStatus;
  createdAt: string;
  updatedAt: string;
  assignedAgent: string;
  slaDeadline: string;
}

export type PlatformTransactionType =
  | "subscription_payment"
  | "deposit_received"
  | "deposit_refunded"
  | "installation_fee"
  | "accessory_sale"
  | "discount"
  | "manual_adjustment";

export interface PlatformTransaction {
  id: string;
  type: PlatformTransactionType;
  storeId: string | null;
  storeName: string | null;
  amountHtg: number;
  method: "cash" | "moncash" | "natcash" | "bank";
  date: string;
  note: string | null;
}

export type StoreTransactionType =
  | "cash_sale"
  | "moncash_sale"
  | "natcash_sale"
  | "payment_pending"
  | "payment_confirmed"
  | "payment_failed"
  | "cancellation"
  | "refund"
  | "webhook_event";

export interface StoreTransaction {
  id: string;
  storeId: string;
  storeName: string;
  type: StoreTransactionType;
  amountHtg: number;
  date: string;
}

export interface SyncHealthRow {
  storeId: string;
  storeName: string;
  deviceId: string;
  lastSyncAt: string;
  pendingActions: number;
  errors: number;
  conflicts: number;
}

export interface AuditLogEntry {
  id: string;
  actor_id: string | null;
  actor_role: AdminRole | string | null;
  actor_name?: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  store_id: string | null;
  reason: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
  lastLoginAt: string | null;
}
