import { createClient } from "@/lib/supabase/client";
import type { LeadFormOutput } from "@/lib/validations/lead";
import type { LeadStage } from "@/types/admin";

export async function createLead(input: LeadFormOutput) {
  const supabase = createClient();
  const { error } = await supabase.from("leads").insert({
    store_name: input.storeName,
    owner_name: input.ownerName,
    phone: input.phone || null,
    whatsapp: input.whatsapp || null,
    address: input.address || null,
    zone: input.zone || null,
    business_type: input.businessType || null,
    estimated_product_count: input.estimatedProductCount ?? null,
    seller_count: input.sellerCount ?? null,
    uses_mobile_money: input.usesMobileMoney,
  });
  if (error) throw new Error(error.message);
}

export async function updateLeadStage(leadId: string, stage: LeadStage) {
  const supabase = createClient();
  const { error } = await supabase
    .from("leads")
    .update({ stage, last_interaction_at: new Date().toISOString() })
    .eq("id", leadId);
  if (error) throw new Error(error.message);
}

export async function convertLeadToStore(leadId: string, storeId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("leads")
    .update({ stage: "converted", converted_store_id: storeId })
    .eq("id", leadId);
  if (error) throw new Error(error.message);
}
