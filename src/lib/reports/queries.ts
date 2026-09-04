import { createClient } from "@/lib/supabase/server";
import type { PaymentMethod, Product } from "@/types";
import type { PeriodRange } from "./period";

export interface ReportSummary {
  total_sales: number;
  transaction_count: number;
  avg_basket: number;
  estimated_profit: number;
}

export interface PaymentBreakdownRow {
  payment_method: PaymentMethod;
  total: number;
  transaction_count: number;
}

export interface TrendPoint {
  bucket_start: string;
  total: number;
}

export interface TopProductRow {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  total_value: number;
}

export interface ReportData {
  summary: ReportSummary;
  paymentBreakdown: PaymentBreakdownRow[];
  trend: TrendPoint[];
  topProducts: TopProductRow[];
  lowStockProducts: Product[];
}

const EMPTY_SUMMARY: ReportSummary = {
  total_sales: 0,
  transaction_count: 0,
  avg_basket: 0,
  estimated_profit: 0,
};

/**
 * Reports are read-only and aggregate across the whole store (all
 * devices), not just this one's local data — so, per
 * docs/PROMPTS/06-reports.md, they're fetched straight from Supabase
 * (via the RPC functions in 00000000000005_report_functions.sql) rather
 * than Dexie, unlike the rest of the app.
 */
export async function fetchReportData(storeId: string, range: PeriodRange): Promise<ReportData> {
  const supabase = await createClient();
  const from_ts = range.from.toISOString();
  const to_ts = range.to.toISOString();

  const [summaryRes, paymentRes, trendRes, topProductsRes, productsRes] = await Promise.all([
    supabase
      .rpc("report_summary", { store_id_param: storeId, from_ts, to_ts })
      .maybeSingle(),
    supabase.rpc("report_payment_breakdown", { store_id_param: storeId, from_ts, to_ts }),
    supabase.rpc("report_sales_trend", {
      store_id_param: storeId,
      from_ts,
      to_ts,
      bucket_unit: range.bucket,
    }),
    supabase.rpc("report_top_products", {
      store_id_param: storeId,
      from_ts,
      to_ts,
      limit_count: 10,
    }),
    supabase.from("products").select("*").eq("store_id", storeId).eq("is_active", true),
  ]);

  // No generated Database types are wired into the Supabase client, so
  // `.rpc()` results come back untyped — cast to the shapes the SQL
  // functions actually return (00000000000005_report_functions.sql).
  const summary = summaryRes.data as ReportSummary | null;
  const paymentBreakdown = paymentRes.data as PaymentBreakdownRow[] | null;
  const trend = trendRes.data as TrendPoint[] | null;
  const topProducts = topProductsRes.data as TopProductRow[] | null;

  const lowStockProducts = (productsRes.data ?? [])
    .filter((p) => p.stock_quantity <= p.low_stock_threshold)
    .sort(
      (a, b) =>
        a.stock_quantity - a.low_stock_threshold - (b.stock_quantity - b.low_stock_threshold),
    );

  return {
    summary: summary ?? EMPTY_SUMMARY,
    paymentBreakdown: paymentBreakdown ?? [],
    trend: trend ?? [],
    topProducts: topProducts ?? [],
    lowStockProducts,
  };
}
