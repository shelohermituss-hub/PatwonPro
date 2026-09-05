import { createClient } from "@/lib/supabase/server";
import type { AdminSubscription } from "@/types/admin";

function computeDaysLate(status: string, currentPeriodEnd: string | null): number {
  if ((status === "past_due" || status === "suspended") && currentPeriodEnd) {
    const diffMs = Date.now() - new Date(currentPeriodEnd).getTime();
    return Math.max(0, Math.floor(diffMs / 86_400_000));
  }
  return 0;
}

function recommendedAction(status: AdminSubscription["status"], daysLate: number): string {
  if (status === "suspended") return "Tann peman oswa reyaktive manyèlman";
  if (daysLate > 14) return "Sispann si pa gen repons apre relans";
  if (daysLate > 0) return "Relanse pwopriyetè a";
  if (status === "trialing") return "Swiv pou konvèsyon";
  return "Okenn";
}

interface SubscriptionRow {
  id: string;
  store_id: string;
  plan: string;
  price_htg: number | null;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  last_reminder_at: string | null;
  created_at: string;
  store: { name: string } | { name: string }[] | null;
  agent: { full_name: string } | { full_name: string }[] | null;
}

/**
 * Reads the real `subscriptions` table (enriched by migration 014) —
 * `daysLate`/`amountDueHtg` are computed here from `current_period_end`,
 * mirroring the SQL `subscription_days_late()` function, rather than
 * stored anywhere (single source of truth: migration 014's own decision).
 */
export async function fetchAdminSubscriptions(): Promise<AdminSubscription[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      "*, store:stores(name), agent:profiles!subscriptions_collection_agent_id_fkey(full_name)",
    )
    .order("current_period_end", { ascending: true });

  if (error) {
    throw new Error(`Pa t kapab chaje abònman yo: ${error.message}`);
  }

  return ((data ?? []) as SubscriptionRow[]).map((row) => {
    const store = Array.isArray(row.store) ? row.store[0] : row.store;
    const agent = Array.isArray(row.agent) ? row.agent[0] : row.agent;
    const status = row.status as AdminSubscription["status"];
    const daysLate = computeDaysLate(row.status, row.current_period_end);

    return {
      id: row.id,
      storeId: row.store_id,
      storeName: store?.name ?? "—",
      plan: row.plan as AdminSubscription["plan"],
      monthlyPriceHtg: row.price_htg ?? 0,
      status,
      startDate: row.current_period_start ?? row.created_at,
      nextDueDate: row.current_period_end ?? "",
      lastPaymentDate: null,
      amountDueHtg: status === "suspended" || daysLate > 0 ? (row.price_htg ?? 0) : 0,
      daysLate,
      collectionAgent: agent?.full_name ?? "Pa asiyen",
      lastReminderAt: row.last_reminder_at,
      recommendedAction: recommendedAction(status, daysLate),
    };
  });
}
