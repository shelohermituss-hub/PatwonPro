import { createClient } from "@/lib/supabase/server";
import type { Lead } from "@/types/admin";

interface LeadRow {
  id: string;
  store_name: string;
  owner_name: string;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  zone: string | null;
  business_type: string | null;
  estimated_product_count: number | null;
  seller_count: number | null;
  uses_mobile_money: boolean;
  device_id: string | null;
  trial_start_date: string | null;
  trial_end_date: string | null;
  last_interaction_at: string;
  objections: string | null;
  loss_reason: string | null;
  stage: string;
  agent: { full_name: string } | { full_name: string }[] | null;
  device: { device_code: string } | { device_code: string }[] | null;
}

export async function fetchLeads(): Promise<Lead[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leads")
    .select("*, agent:profiles!leads_agent_id_fkey(full_name), device:devices(device_code)")
    .order("last_interaction_at", { ascending: false });

  if (error) {
    throw new Error(`Pa t kapab chaje lead yo: ${error.message}`);
  }

  return ((data ?? []) as LeadRow[]).map((row) => {
    const agent = Array.isArray(row.agent) ? row.agent[0] : row.agent;
    const device = Array.isArray(row.device) ? row.device[0] : row.device;
    return {
      id: row.id,
      storeName: row.store_name,
      ownerName: row.owner_name,
      phone: row.phone ?? "—",
      whatsapp: row.whatsapp ?? "—",
      address: row.address ?? "—",
      zone: row.zone ?? "—",
      businessType: row.business_type ?? "—",
      estimatedProductCount: row.estimated_product_count ?? 0,
      sellerCount: row.seller_count ?? 0,
      usesMobileMoney: row.uses_mobile_money,
      agentName: agent?.full_name ?? "Pa asiyen",
      deviceId: device?.device_code ?? null,
      trialStartDate: row.trial_start_date,
      trialEndDate: row.trial_end_date,
      lastInteractionAt: row.last_interaction_at,
      objections: row.objections,
      lossReason: row.loss_reason,
      stage: row.stage as Lead["stage"],
    };
  });
}
