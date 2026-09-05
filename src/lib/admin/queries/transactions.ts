import { createClient } from "@/lib/supabase/server";
import type { PlatformTransaction, StoreTransaction, StoreTransactionType } from "@/types/admin";

interface PlatformRow {
  id: string;
  type: string;
  store_id: string | null;
  amount_htg: number;
  method: string;
  occurred_at: string;
  note: string | null;
  store: { name: string } | { name: string }[] | null;
}

export async function fetchPlatformTransactions(limit = 200): Promise<PlatformTransaction[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("platform_transactions")
    .select("*, store:stores(name)")
    .order("occurred_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Pa t kapab chaje finans Jere Boutik yo: ${error.message}`);
  }

  return ((data ?? []) as PlatformRow[]).map((row) => {
    const store = Array.isArray(row.store) ? row.store[0] : row.store;
    return {
      id: row.id,
      type: row.type as PlatformTransaction["type"],
      storeId: row.store_id,
      storeName: store?.name ?? null,
      amountHtg: row.amount_htg,
      method: row.method as PlatformTransaction["method"],
      date: row.occurred_at,
      note: row.note,
    };
  });
}

const SALE_TYPE_BY_METHOD: Record<string, StoreTransactionType> = {
  cash: "cash_sale",
  credit: "credit_sale",
  moncash: "moncash_sale",
  natcash: "natcash_sale",
};

const PAYMENT_TX_TYPE: Record<string, StoreTransactionType> = {
  pending: "payment_pending",
  paid: "payment_confirmed",
  failed: "payment_failed",
  expired: "payment_failed",
  cancelled: "cancellation",
};

/**
 * Merges real `sales` (instant register transactions) and
 * `payment_transactions` (MonCash/NatCash async lifecycle) into one
 * chronological "store transactions" feed — mirrors what the mock UI
 * showed as a single unified list, now sourced from two real tables
 * rather than one duplicated admin-only table.
 */
export async function fetchStoreTransactions(limit = 200): Promise<StoreTransaction[]> {
  const supabase = await createClient();

  const [{ data: sales, error: salesError }, { data: paymentTx, error: ptError }] = await Promise.all([
    supabase
      .from("sales")
      .select("id, store_id, payment_method, total, created_at, store:stores(name)")
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("payment_transactions")
      .select("id, store_id, amount, status, created_at, store:stores(name)")
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);

  if (salesError) throw new Error(`Pa t kapab chaje vant yo: ${salesError.message}`);
  if (ptError) throw new Error(`Pa t kapab chaje tranzaksyon peman yo: ${ptError.message}`);

  interface JoinedRow {
    id: string;
    store_id: string;
    created_at: string;
    store: { name: string } | { name: string }[] | null;
  }

  const storeName = (row: JoinedRow) => {
    const s = Array.isArray(row.store) ? row.store[0] : row.store;
    return s?.name ?? "—";
  };

  const fromSales: StoreTransaction[] = (sales ?? []).map((row) => ({
    id: `sale_${row.id}`,
    storeId: row.store_id,
    storeName: storeName(row),
    type: SALE_TYPE_BY_METHOD[row.payment_method] ?? "cash_sale",
    amountHtg: row.total,
    date: row.created_at,
  }));

  const fromPaymentTx: StoreTransaction[] = (paymentTx ?? []).map((row) => ({
    id: `pt_${row.id}`,
    storeId: row.store_id,
    storeName: storeName(row),
    type: PAYMENT_TX_TYPE[row.status] ?? "payment_pending",
    amountHtg: row.amount,
    date: row.created_at,
  }));

  return [...fromSales, ...fromPaymentTx]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}
