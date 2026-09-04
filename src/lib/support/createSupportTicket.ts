import { createClient } from "@/lib/supabase/client";

export interface CreateSupportTicketInput {
  storeId: string;
  createdBy: string;
  subject: string;
  message: string;
}

/**
 * Support tickets are online-only (low-volume, platform-team-facing, no
 * offline need — unlike sales/products/credits), so this writes straight
 * to Supabase rather than through Dexie/the sync engine.
 */
export async function createSupportTicket(input: CreateSupportTicketInput) {
  const supabase = createClient();
  const { error } = await supabase.from("support_tickets").insert({
    store_id: input.storeId,
    created_by: input.createdBy,
    subject: input.subject,
    message: input.message,
  });
  return { error };
}
