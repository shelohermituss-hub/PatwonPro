import { useSyncExternalStore } from "react";
import type { AdminRole, AuditLogEntry } from "@/types/admin";
import { AUDIT_LOG_SEED } from "@/lib/admin/mock/auditLog";

/**
 * In-memory mock audit trail — every confirmed sensitive action in the
 * admin back-office appends here so `/admin/audit-log` shows it live
 * during the session. Resets on refresh: there is no `audit_logs` table
 * yet (see docs/ADMIN_DASHBOARD_ARCHITECTURE.md "phase 2 backend").
 */
let entries: AuditLogEntry[] = [...AUDIT_LOG_SEED];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function recordAuditEvent(input: {
  actorId: string;
  actorRole: AdminRole;
  action: string;
  resourceType: string;
  resourceId: string;
  storeId?: string | null;
  reason?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const entry: AuditLogEntry = {
    id: `audit_${Date.now()}_${Math.round(Math.random() * 1e6)}`,
    actor_id: input.actorId,
    actor_role: input.actorRole,
    action: input.action,
    resource_type: input.resourceType,
    resource_id: input.resourceId,
    store_id: input.storeId ?? null,
    reason: input.reason ?? null,
    metadata: input.metadata ?? {},
    ip_address: null,
    created_at: new Date().toISOString(),
  };
  entries = [entry, ...entries];
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return entries;
}

function getServerSnapshot() {
  return AUDIT_LOG_SEED;
}

export function useAuditLog(): AuditLogEntry[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
