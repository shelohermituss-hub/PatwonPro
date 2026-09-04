import { createClient } from "@/lib/supabase/server";
import type { Device, Subscription, SupportTicket } from "@/types";

export interface SubscriptionData {
  subscription: Subscription | null;
  devices: Device[];
  tickets: SupportTicket[];
}

/**
 * Subscription/device/support data is read-only for store members (only
 * `platform_admin` writes subscriptions/devices, see 00000000000001_init.sql)
 * and low-volume, so — like reports — it's fetched straight from Supabase
 * rather than mirrored into Dexie.
 */
export async function fetchSubscriptionData(storeId: string): Promise<SubscriptionData> {
  const supabase = await createClient();

  const [{ data: subscription }, { data: devices }, { data: tickets }] = await Promise.all([
    supabase.from("subscriptions").select("*").eq("store_id", storeId).maybeSingle(),
    supabase.from("devices").select("*").eq("store_id", storeId).order("name"),
    supabase
      .from("support_tickets")
      .select("*")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false }),
  ]);

  return {
    subscription: subscription ?? null,
    devices: devices ?? [],
    tickets: tickets ?? [],
  };
}
