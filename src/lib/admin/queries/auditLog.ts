import { createClient } from "@/lib/supabase/server";
import type { AuditLogEntry } from "@/types/admin";

interface AuditLogRow {
  id: string;
  actor_id: string | null;
  actor_role: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  store_id: string | null;
  reason: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
  actor: { full_name: string } | { full_name: string }[] | null;
}

/**
 * Reads the real `audit_logs` table (migration 023) for `/admin/audit-log`
 * — RLS (`audit_logs_select_admin`) already restricts this to
 * `platform_admin`, so no extra filtering needed here.
 */
export async function fetchAuditLog(limit = 200): Promise<AuditLogEntry[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("audit_logs")
    .select("*, actor:profiles!audit_logs_actor_id_fkey(full_name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Pa t kapab chaje jounal odit la: ${error.message}`);
  }

  return ((data ?? []) as AuditLogRow[]).map((row) => {
    const actor = Array.isArray(row.actor) ? row.actor[0] : row.actor;
    return {
      id: row.id,
      actor_id: row.actor_id,
      actor_role: row.actor_role,
      actor_name: actor?.full_name ?? null,
      action: row.action,
      resource_type: row.resource_type,
      resource_id: row.resource_id,
      store_id: row.store_id,
      reason: row.reason,
      metadata: row.metadata,
      ip_address: row.ip_address,
      created_at: row.created_at,
    };
  });
}
