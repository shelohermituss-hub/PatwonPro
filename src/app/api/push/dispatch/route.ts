import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToProfile } from "@/lib/push/send";
import { dispatchNotificationCampaign } from "@/lib/notifications/dispatchCampaign";

/**
 * Called by `pg_cron` (via `net.http_post`, no Supabase session — see
 * migration 042) for scheduled/recurring work. Two request shapes:
 * - `{ kind: "campaign", campaignId }` — a `scheduled_once`/`recurring`
 *   admin notification campaign (an `immediate` one dispatches
 *   synchronously from `createNotificationCampaign` instead, no HTTP
 *   round-trip needed).
 * - `{ kind: "scheduled_alerts" }` — the daily low-stock/overdue-credit
 *   check (`ensure_scheduled_alerts_cron`).
 * Authenticated by a shared secret header, not a user session — this
 * route can be called with no admin (or any) Supabase session at all.
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-push-dispatch-secret");
  if (!secret || secret !== process.env.PUSH_DISPATCH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (body?.kind === "campaign" && typeof body.campaignId === "string") {
    const result = await dispatchNotificationCampaign(body.campaignId);
    return NextResponse.json(result, { status: result.ok ? 200 : 404 });
  }

  if (body?.kind === "scheduled_alerts") {
    return dispatchScheduledAlerts();
  }

  return NextResponse.json({ error: "Kalite dispatch envalid." }, { status: 400 });
}

const OVERDUE_DAYS = 30;

async function dispatchScheduledAlerts() {
  const admin = createAdminClient();
  const now = Date.now();

  const [productsRes, creditSalesRes, ownersRes] = await Promise.all([
    admin.from("products").select("id, store_id, stock_quantity, low_stock_threshold").eq("is_active", true),
    admin
      .from("sales")
      .select("id, store_id, total, created_at")
      .eq("payment_method", "credit")
      .neq("payment_status", "paid"),
    admin.from("profiles").select("id, store_id").eq("role", "owner"),
  ]);

  const ownerByStore = new Map((ownersRes.data ?? []).map((p) => [p.store_id, p.id]));

  // Low stock — count of affected products per store.
  const lowStockByStore = new Map<string, number>();
  for (const product of productsRes.data ?? []) {
    if (product.stock_quantity <= product.low_stock_threshold) {
      lowStockByStore.set(product.store_id, (lowStockByStore.get(product.store_id) ?? 0) + 1);
    }
  }

  // Overdue credit — needs remaining balance per sale (total minus its payments).
  const creditSales = creditSalesRes.data ?? [];
  const saleIds = creditSales.map((s) => s.id);
  const paidBySale = new Map<string, number>();
  if (saleIds.length > 0) {
    const { data: payments } = await admin.from("credit_payments").select("sale_id, amount").in("sale_id", saleIds);
    for (const payment of payments ?? []) {
      if (!payment.sale_id) continue;
      paidBySale.set(payment.sale_id, (paidBySale.get(payment.sale_id) ?? 0) + payment.amount);
    }
  }

  const overdueByStore = new Map<string, { count: number; totalHtg: number }>();
  for (const sale of creditSales) {
    const remaining = sale.total - (paidBySale.get(sale.id) ?? 0);
    const ageDays = (now - new Date(sale.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (remaining > 0 && ageDays > OVERDUE_DAYS) {
      const entry = overdueByStore.get(sale.store_id) ?? { count: 0, totalHtg: 0 };
      entry.count += 1;
      entry.totalHtg += remaining;
      overdueByStore.set(sale.store_id, entry);
    }
  }

  let notified = 0;

  for (const [storeId, count] of lowStockByStore) {
    const profileId = ownerByStore.get(storeId);
    if (!profileId) continue;
    const result = await sendPushToProfile(profileId, {
      category: "low_stock",
      title: "Stòk ba",
      body: `${count} pwodwi gen stòk ki ba — verifye envantè ou.`,
      url: "/products",
    });
    if (result.sent > 0) notified += 1;
  }

  for (const [storeId, { count, totalHtg }] of overdueByStore) {
    const profileId = ownerByStore.get(storeId);
    if (!profileId) continue;
    const result = await sendPushToProfile(profileId, {
      category: "credit_overdue",
      title: "Kredi an reta",
      body: `${count} kredi an reta pou yon total ${Math.round(totalHtg)} HTG.`,
      url: "/credits",
    });
    if (result.sent > 0) notified += 1;
  }

  return NextResponse.json({ ok: true, storesNotified: notified });
}
