import { createClient } from "@/lib/supabase/client";
import type { AdminSupportStatus, SupportPriority } from "@/types/admin";

/** RLS (`support_tickets_update_admin`, migration 017) requires `admin_can('manage_support')`. */
export async function updateTicketStatus(ticketId: string, status: AdminSupportStatus) {
  const supabase = createClient();
  const { error } = await supabase.from("support_tickets").update({ status }).eq("id", ticketId);
  if (error) throw new Error(error.message);
}

export async function updateTicketPriority(ticketId: string, priority: SupportPriority) {
  const supabase = createClient();
  const { error } = await supabase.from("support_tickets").update({ priority }).eq("id", ticketId);
  if (error) throw new Error(error.message);
}

export async function assignTicket(ticketId: string, agentId: string | null) {
  const supabase = createClient();
  const { error } = await supabase.from("support_tickets").update({ assigned_agent_id: agentId }).eq("id", ticketId);
  if (error) throw new Error(error.message);
}
