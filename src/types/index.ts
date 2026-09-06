import type { AdminRole } from "@/types/admin";

export type UserRole = "owner" | "employee" | "platform_admin";

export type PaymentMethod = "cash" | "moncash" | "natcash" | "credit";

export type PaymentStatus = "paid" | "partial" | "credit";

export type PaymentTransactionStatus = "pending" | "paid" | "failed" | "cancelled" | "expired";

export type SubscriptionPlan = "starter" | "pro" | "enterprise";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "expired"
  | "suspended";

export type DeviceStatus =
  | "in_stock"
  | "reserved"
  | "deployed_trial"
  | "deployed_active"
  | "repair"
  | "returned"
  | "refurbished"
  | "lost"
  | "retired";

export type SupportTicketStatus = "open" | "in_progress" | "resolved" | "closed";

export type DepositStatus =
  | "pending"
  | "received"
  | "held"
  | "eligible_for_refund"
  | "refund_requested"
  | "refunded"
  | "partially_retained"
  | "fully_retained";

export type DepositPaymentMode = "lump_sum" | "monthly_installment";

export type SubscriptionPaymentKind = "subscription" | "deposit";

export type SubscriptionPaymentStatus = "pending" | "paid" | "failed";

export type ReplacementRequestStatus = "pending" | "approved" | "rejected" | "completed";

export type SyncStatus = "pending" | "synced";

export type StockEntryType = "restock" | "correction" | "adjustment";

export interface Store {
  id: string;
  name: string;
  owner_id: string;
  currency: string;
  address: string | null;
  phone: string | null;
  logo_url: string | null;
  moncash_phone: string | null;
  moncash_qr_url: string | null;
  natcash_phone: string | null;
  natcash_qr_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  /** Null only for `platform_admin` — that role isn't scoped to one store. */
  store_id: string | null;
  full_name: string;
  role: UserRole;
  /** Only set when `role = "platform_admin"` — see migration 011. */
  admin_role: AdminRole | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  store_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  category_id: string | null;
  name: string;
  sku: string | null;
  unit: string;
  cost_price: number;
  sale_price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  image_url: string | null;
  sync_status: SyncStatus;
  /** Dexie-only bookkeeping for retry backoff — stripped before upload. */
  sync_attempts?: number;
  /** Dexie-only: ISO timestamp; sync engine skips this product until then. */
  next_sync_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  store_id: string;
  full_name: string;
  phone: string | null;
  credit_limit: number;
  credit_balance: number;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  store_id: string;
  employee_id: string;
  customer_id: string | null;
  subtotal: number;
  discount: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  sync_status: SyncStatus;
  /** Dexie-only bookkeeping for retry backoff — stripped before upload. */
  sync_attempts?: number;
  /** Dexie-only: ISO timestamp; sync engine skips this sale until then. */
  next_sync_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  created_at: string;
}

export interface CreditPayment {
  id: string;
  store_id: string;
  customer_id: string;
  sale_id: string | null;
  amount: number;
  payment_method: PaymentMethod;
  sync_status: SyncStatus;
  /** Dexie-only bookkeeping for retry backoff — stripped before upload. */
  sync_attempts?: number;
  /** Dexie-only: ISO timestamp; sync engine skips this payment until then. */
  next_sync_at?: string | null;
  created_at: string;
}

export interface StockEntry {
  id: string;
  store_id: string;
  product_id: string;
  employee_id: string;
  entry_type: StockEntryType;
  quantity_delta: number;
  stock_before: number;
  stock_after: number;
  reason: string | null;
  sync_status: SyncStatus;
  /** Dexie-only bookkeeping for retry backoff — stripped before upload. */
  sync_attempts?: number;
  /** Dexie-only: ISO timestamp; sync engine skips this entry until then. */
  next_sync_at?: string | null;
  created_at: string;
}

export interface PaymentTransaction {
  id: string;
  store_id: string;
  sale_id: string | null;
  provider: "moncash" | "natcash";
  provider_reference: string | null;
  amount: number;
  status: PaymentTransactionStatus;
  /** Raw webhook payload for audit/debugging — never a secret/signature value. */
  raw_event: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  store_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  price_htg: number | null;
  created_at: string;
  updated_at: string;
}

export interface Device {
  id: string;
  store_id: string;
  name: string;
  device_identifier: string | null;
  device_code: string | null;
  serial_number: string | null;
  brand: string | null;
  model: string | null;
  model_photo_url: string | null;
  status: DeviceStatus;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportTicket {
  id: string;
  store_id: string;
  created_by: string;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  created_at: string;
  updated_at: string;
}

export interface Deposit {
  id: string;
  store_id: string;
  device_id: string;
  amount_htg: number;
  amount_paid_htg: number;
  payment_mode: DepositPaymentMode;
  monthly_installment_htg: number | null;
  status: DepositStatus;
  created_at: string;
}

export interface SubscriptionPayment {
  id: string;
  store_id: string;
  kind: SubscriptionPaymentKind;
  deposit_id: string | null;
  amount_htg: number;
  method: "moncash" | "natcash";
  gateway_transaction_id: string | null;
  status: SubscriptionPaymentStatus;
  paid_at: string | null;
  created_at: string;
}

export interface ReplacementRequest {
  id: string;
  store_id: string;
  device_id: string;
  reason: string;
  status: ReplacementRequestStatus;
  replacement_device_id: string | null;
  resolution_note: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}
