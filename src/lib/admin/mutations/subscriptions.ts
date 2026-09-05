import { createClient } from "@/lib/supabase/client";

/**
 * Client-side mutations for `/admin/subscriptions` and the store detail
 * page's "Abònman" tab. RLS (`admin_can('manage_subscriptions')`) is the
 * real gate — an admin role without it gets a Postgres error here, which
 * `ConfirmActionDialog` surfaces as a toast.
 */
export async function sendSubscriptionReminder(subscriptionId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("subscriptions")
    .update({ last_reminder_at: new Date().toISOString() })
    .eq("id", subscriptionId);
  if (error) throw new Error(error.message);
}

export async function suspendSubscription(subscriptionId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "suspended" })
    .eq("id", subscriptionId);
  if (error) throw new Error(error.message);
}

export async function reactivateSubscription(subscriptionId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "active" })
    .eq("id", subscriptionId);
  if (error) throw new Error(error.message);
}

export async function convertTrialToActive(subscriptionId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "active" })
    .eq("id", subscriptionId);
  if (error) throw new Error(error.message);
}

export async function extendTrial(subscriptionId: string, currentPeriodEnd: string | null, days = 15) {
  const supabase = createClient();
  const base = currentPeriodEnd ? new Date(currentPeriodEnd) : new Date();
  base.setDate(base.getDate() + days);
  const { error } = await supabase
    .from("subscriptions")
    .update({ current_period_end: base.toISOString() })
    .eq("id", subscriptionId);
  if (error) throw new Error(error.message);
}

export async function closeContract(subscriptionId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "canceled" })
    .eq("id", subscriptionId);
  if (error) throw new Error(error.message);
}
