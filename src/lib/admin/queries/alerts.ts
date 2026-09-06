import { createClient } from "@/lib/supabase/server";

/**
 * Real count behind the header notification bell — open support tickets +
 * subscriptions currently past due/suspended + devices reporting sync
 * errors. Three cheap `head: true` counts rather than fetching full rows,
 * since only the total is needed here (each page still has its own
 * detailed query for the actual list).
 */
export async function fetchAdminAlertCount(): Promise<number> {
  const supabase = await createClient();

  const [tickets, subscriptions, devices] = await Promise.all([
    supabase.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .in("status", ["past_due", "suspended"]),
    supabase.from("devices").select("*", { count: "exact", head: true }).gt("sync_errors", 0),
  ]);

  return (tickets.count ?? 0) + (subscriptions.count ?? 0) + (devices.count ?? 0);
}
