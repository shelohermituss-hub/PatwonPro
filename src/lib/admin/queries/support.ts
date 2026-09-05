import { createClient } from "@/lib/supabase/server";
import type { AdminSupportTicket } from "@/types/admin";

interface TicketRow {
  id: string;
  store_id: string;
  subject: string;
  category: string | null;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  sla_deadline: string | null;
  store: { name: string } | { name: string }[] | null;
  agent: { full_name: string } | { full_name: string }[] | null;
}

export async function fetchAdminSupportTickets(): Promise<AdminSupportTicket[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("support_tickets")
    .select(
      "*, store:stores(name), agent:profiles!support_tickets_assigned_agent_id_fkey(full_name)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Pa t kapab chaje tikè sipò yo: ${error.message}`);
  }

  return ((data ?? []) as TicketRow[]).map((row) => {
    const store = Array.isArray(row.store) ? row.store[0] : row.store;
    const agent = Array.isArray(row.agent) ? row.agent[0] : row.agent;
    return {
      id: row.id,
      storeId: row.store_id,
      storeName: store?.name ?? "—",
      subject: row.subject,
      category: row.category as AdminSupportTicket["category"],
      priority: row.priority as AdminSupportTicket["priority"],
      status: row.status as AdminSupportTicket["status"],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      assignedAgent: agent?.full_name ?? "Pa asiyen",
      slaDeadline: row.sla_deadline ?? row.created_at,
    };
  });
}
