import { createClient } from "@/lib/supabase/server";
import type { AdminStore, StoreSubscriptionStatus } from "@/types/admin";

/** Lightweight id/name list for dropdowns (lead conversion, installation linking) — not the full CRM rollup. */
export async function fetchStoreOptions(): Promise<{ id: string; name: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("stores").select("id, name").order("name");
  if (error) throw new Error(`Pa t kapab chaje lis boutik yo: ${error.message}`);
  return data ?? [];
}

function rollupStatus(subStatus: string | undefined, daysLate: number): StoreSubscriptionStatus {
  if (!subStatus) return "trial";
  if (subStatus === "trialing") return "trial";
  if (subStatus === "suspended") return "suspended";
  if (subStatus === "canceled" || subStatus === "expired") return "closed";
  if (subStatus === "past_due" || daysLate > 0) return "overdue";
  return "active";
}

function computeDaysLate(status: string | undefined, currentPeriodEnd: string | null | undefined): number {
  if ((status === "past_due" || status === "suspended") && currentPeriodEnd) {
    const diffMs = Date.now() - new Date(currentPeriodEnd).getTime();
    return Math.max(0, Math.floor(diffMs / 86_400_000));
  }
  return 0;
}

/**
 * Store-level CRM rollup for `/admin/stores`. The real `stores` table
 * (migration 001) is deliberately lean — no zone/business-type/WhatsApp
 * columns, those belong to the sales pipeline. When a store came through
 * a converted lead, this joins in that lead's intake data; a
 * self-registered store (via /register, no lead) shows "—" for those
 * fields rather than fabricated demo values.
 */
export async function fetchAdminStores(): Promise<AdminStore[]> {
  const supabase = await createClient();

  const { data: stores, error: storesError } = await supabase
    .from("stores")
    .select("id, name, owner_id, phone, address, created_at");
  if (storesError) throw new Error(`Pa t kapab chaje boutik yo: ${storesError.message}`);

  const storeIds = (stores ?? []).map((s) => s.id);
  if (storeIds.length === 0) return [];

  const ownerIds = Array.from(new Set((stores ?? []).map((s) => s.owner_id)));

  const [
    { data: subscriptions },
    { data: devices },
    { data: leads },
    { data: sales },
    { data: owners },
  ] = await Promise.all([
    supabase.from("subscriptions").select("*").in("store_id", storeIds),
    supabase.from("devices").select("device_code, last_seen_at, store_id").in("store_id", storeIds),
    supabase
      .from("leads")
      .select("converted_store_id, business_type, zone, whatsapp, agent_id")
      .in("converted_store_id", storeIds),
    supabase
      .from("sales")
      .select("store_id, payment_method, created_at")
      .in("store_id", storeIds)
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, full_name").in("id", ownerIds),
  ]);

  const agentIds = Array.from(new Set((leads ?? []).map((l) => l.agent_id).filter((id): id is string => !!id)));
  const { data: agents } = agentIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", agentIds)
    : { data: [] as { id: string; full_name: string }[] };

  const ownerById = new Map((owners ?? []).map((o) => [o.id, o.full_name]));
  const agentById = new Map((agents ?? []).map((a) => [a.id, a.full_name]));
  const subByStore = new Map((subscriptions ?? []).map((s) => [s.store_id, s]));
  const leadByStore = new Map((leads ?? []).map((l) => [l.converted_store_id, l]));

  const devicesByStore = new Map<string, { device_code: string; last_seen_at: string | null }[]>();
  for (const d of devices ?? []) {
    if (!d.store_id) continue;
    const list = devicesByStore.get(d.store_id) ?? [];
    list.push(d);
    devicesByStore.set(d.store_id, list);
  }

  const salesByStore = new Map<string, { payment_method: string; created_at: string }[]>();
  for (const s of sales ?? []) {
    const list = salesByStore.get(s.store_id) ?? [];
    list.push(s);
    salesByStore.set(s.store_id, list);
  }

  return (stores ?? []).map((store): AdminStore => {
    const sub = subByStore.get(store.id);
    const lead = leadByStore.get(store.id);
    const storeDevices = devicesByStore.get(store.id) ?? [];
    const storeSales = salesByStore.get(store.id) ?? [];
    const daysLate = computeDaysLate(sub?.status, sub?.current_period_end);
    const lastSeenTimes = storeDevices.map((d) => d.last_seen_at).filter((v): v is string => !!v);

    return {
      id: store.id,
      name: store.name,
      ownerName: ownerById.get(store.owner_id) ?? "—",
      phone: store.phone ?? "—",
      whatsapp: lead?.whatsapp ?? "—",
      address: store.address ?? "—",
      zone: lead?.zone ?? "—",
      businessType: lead?.business_type ?? "—",
      subscriptionStatus: rollupStatus(sub?.status, daysLate),
      plan: (sub?.plan as AdminStore["plan"]) ?? "starter",
      monthlyPriceHtg: sub?.price_htg ?? 0,
      nextDueDate: sub?.current_period_end ?? null,
      daysLate,
      lastSaleAt: storeSales[0]?.created_at ?? null,
      lastSyncAt: lastSeenTimes.length > 0 ? lastSeenTimes.sort().at(-1)! : null,
      deviceId: storeDevices[0]?.device_code ?? null,
      agentName: lead?.agent_id ? (agentById.get(lead.agent_id) ?? "—") : "—",
      installedAt: store.created_at,
      usesMonCash: storeSales.some((s) => s.payment_method === "moncash"),
      usesNatCash: storeSales.some((s) => s.payment_method === "natcash"),
    };
  });
}
