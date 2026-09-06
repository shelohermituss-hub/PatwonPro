import { createClient } from "@/lib/supabase/server";
import type { Deposit, Device, Subscription, SupportTicket } from "@/types";

export interface SubscriptionData {
  subscription: Subscription | null;
  devices: Device[];
  tickets: SupportTicket[];
  /** Non-terminal deposits only (excludes `refunded`/`fully_retained`) — nothing left for the merchant to do on those. */
  deposits: Deposit[];
}

/**
 * Subscription/device/support data is read-only for store members (only
 * `platform_admin` writes subscriptions/devices, see 00000000000001_init.sql)
 * and low-volume, so — like reports — it's fetched straight from Supabase
 * rather than mirrored into Dexie. `deposits` became readable to store
 * members in migration 036 (`deposits_select_member`) so the merchant can
 * finally see — and pay — their own tablet's security deposit.
 */
export async function fetchSubscriptionData(storeId: string): Promise<SubscriptionData> {
  const supabase = await createClient();

  const [{ data: subscription }, { data: devices }, { data: tickets }, { data: deposits }] =
    await Promise.all([
      supabase.from("subscriptions").select("*").eq("store_id", storeId).maybeSingle(),
      supabase.from("devices").select("*").eq("store_id", storeId).order("name"),
      supabase
        .from("support_tickets")
        .select("*")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false }),
      supabase
        .from("deposits")
        .select("*")
        .eq("store_id", storeId)
        .not("status", "in", "(refunded,fully_retained)")
        .order("created_at", { ascending: false }),
    ]);

  return {
    subscription: subscription ?? null,
    devices: devices ?? [],
    tickets: tickets ?? [],
    deposits: deposits ?? [],
  };
}
