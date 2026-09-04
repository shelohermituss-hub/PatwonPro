export type UserRole = "owner" | "manager" | "cashier";

export type PaymentMethod = "cash" | "moncash" | "natcash" | "credit";

export type PaymentStatus = "paid" | "partial" | "credit";

export type SyncStatus = "pending" | "synced";

export interface Store {
  id: string;
  name: string;
  owner_id: string;
  currency: string;
  address: string | null;
  phone: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  store_id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface Category {
  id: string;
  store_id: string;
  name: string;
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
}

export interface Sale {
  id: string;
  store_id: string;
  cashier_id: string;
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
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface CreditPayment {
  id: string;
  store_id: string;
  customer_id: string;
  sale_id: string | null;
  amount: number;
  payment_method: PaymentMethod;
  created_at: string;
}

export interface PaymentTransaction {
  id: string;
  store_id: string;
  sale_id: string | null;
  provider: "moncash" | "natcash";
  provider_reference: string | null;
  amount: number;
  status: "pending" | "success" | "failed";
  created_at: string;
}
