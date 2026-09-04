import { createClient } from "@/lib/supabase/server";
import { fetchReportData } from "@/lib/reports/queries";
import { resolvePeriodRange } from "@/lib/reports/period";
import type { PaymentMethod, PaymentStatus, Product } from "@/types";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface DashboardSale {
  id: string;
  customerName: string | null;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  created_at: string;
}

export interface DashboardData {
  storeName: string;
  todaySales: number;
  yesterdaySales: number;
  todayTransactionCount: number;
  todayProfit: number;
  yesterdayProfit: number;
  lowStockProducts: Product[];
  outOfStockCount: number;
  creditReceivable: number;
  creditCustomersCount: number;
  trend: { bucket_start: string; total: number }[];
  recentSales: DashboardSale[];
}

/**
 * Everything the dashboard needs, in one place — mirrors
 * src/lib/reports/queries.ts's own rationale: an owner's "right now"
 * summary has to be accurate across every device/employee in the store,
 * not just this tablet's local Dexie data, so it reads Supabase directly
 * rather than IndexedDB (unlike the offline-first POS/products screens).
 */
export async function fetchDashboardData(storeId: string): Promise<DashboardData> {
  const supabase = await createClient();

  const todayRange = resolvePeriodRange("today");
  const yesterdayRange = {
    from: new Date(todayRange.from.getTime() - DAY_MS),
    to: todayRange.from,
    bucket: "hour" as const,
  };
  const sevenDayRange = {
    from: new Date(todayRange.from.getTime() - 6 * DAY_MS),
    to: todayRange.to,
    bucket: "day" as const,
  };

  const [todayData, yesterdayData, sevenDayData, storeRes, customersRes, salesRes] =
    await Promise.all([
      fetchReportData(storeId, todayRange),
      fetchReportData(storeId, yesterdayRange),
      fetchReportData(storeId, sevenDayRange),
      supabase.from("stores").select("name").eq("id", storeId).maybeSingle(),
      supabase
        .from("customers")
        .select("id, credit_balance")
        .eq("store_id", storeId)
        .gt("credit_balance", 0),
      supabase
        .from("sales")
        .select("id, customer_id, total, payment_method, payment_status, created_at")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const customersWithDebt = customersRes.data ?? [];
  const creditReceivable = customersWithDebt.reduce((sum, c) => sum + c.credit_balance, 0);

  const saleRows = salesRes.data ?? [];
  const customerIds = [
    ...new Set(saleRows.map((s) => s.customer_id).filter((id): id is string => !!id)),
  ];

  let customerNameById = new Map<string, string>();
  if (customerIds.length > 0) {
    const { data: saleCustomers } = await supabase
      .from("customers")
      .select("id, full_name")
      .in("id", customerIds);
    customerNameById = new Map((saleCustomers ?? []).map((c) => [c.id, c.full_name]));
  }

  const recentSales: DashboardSale[] = saleRows.map((s) => ({
    id: s.id,
    customerName: s.customer_id ? (customerNameById.get(s.customer_id) ?? null) : null,
    total: s.total,
    payment_method: s.payment_method,
    payment_status: s.payment_status,
    created_at: s.created_at,
  }));

  return {
    storeName: storeRes.data?.name ?? "Boutik ou",
    todaySales: todayData.summary.total_sales,
    yesterdaySales: yesterdayData.summary.total_sales,
    todayTransactionCount: todayData.summary.transaction_count,
    todayProfit: todayData.summary.estimated_profit,
    yesterdayProfit: yesterdayData.summary.estimated_profit,
    lowStockProducts: todayData.lowStockProducts,
    outOfStockCount: todayData.lowStockProducts.filter((p) => p.stock_quantity <= 0).length,
    creditReceivable,
    creditCustomersCount: customersWithDebt.length,
    trend: sevenDayData.trend,
    recentSales,
  };
}
