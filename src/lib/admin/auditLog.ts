import { createClient } from "@/lib/supabase/client";
import type { AdminRole } from "@/types/admin";

/**
 * Writes to the real `audit_logs` table (migration 023) — insert-only,
 * gated by `is_platform_admin()` RLS. Called from Client Components
 * (`ConfirmActionDialog`), so this uses the browser Supabase client.
 * `ip_address` is left null: capturing the real client IP needs a
 * server-side request, which no admin action currently routes through.
 */
export async function recordAuditEvent(input: {
  actorId: string;
  actorRole: AdminRole;
  action: string;
  resourceType: string;
  resourceId: string;
  storeId?: string | null;
  reason?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createClient();

  const { error } = await supabase.from("audit_logs").insert({
    actor_id: input.actorId,
    actor_role: input.actorRole,
    action: input.action,
    resource_type: input.resourceType,
    resource_id: input.resourceId,
    store_id: input.storeId ?? null,
    reason: input.reason ?? null,
    metadata: input.metadata ?? {},
  });

  if (error) {
    throw new Error(`Pa t kapab anrejistre nan jounal odit la: ${error.message}`);
  }
}
