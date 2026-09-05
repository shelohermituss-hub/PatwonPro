import { fetchAdminStores } from "@/lib/admin/queries/stores";
import { fetchAdminSubscriptions } from "@/lib/admin/queries/subscriptions";
import { fetchAdminDevices } from "@/lib/admin/queries/devices";
import { fetchAdminSupportTickets } from "@/lib/admin/queries/support";
import { fetchStoreTransactions } from "@/lib/admin/queries/transactions";
import { fetchAuditLog } from "@/lib/admin/queries/auditLog";
import type {
  AdminDevice,
  AdminStore,
  AdminSubscription,
  AdminSupportTicket,
  AuditLogEntry,
  StoreTransaction,
} from "@/types/admin";

export interface StoreDetail {
  store: AdminStore;
  subscription: AdminSubscription | null;
  device: AdminDevice | null;
  transactions: StoreTransaction[];
  tickets: AdminSupportTicket[];
  auditEntries: AuditLogEntry[];
}

/**
 * Assembles one store's full detail page from the per-domain admin
 * queries — small enough real data volume today that re-fetching each
 * domain and filtering in memory is simpler than a bespoke joined query,
 * and keeps this page's data honest with the list pages it links from.
 */
export async function fetchStoreDetail(storeId: string): Promise<StoreDetail | null> {
  const [stores, subscriptions, devices, tickets, transactions, auditEntries] = await Promise.all([
    fetchAdminStores(),
    fetchAdminSubscriptions(),
    fetchAdminDevices(),
    fetchAdminSupportTickets(),
    fetchStoreTransactions(),
    fetchAuditLog(),
  ]);

  const store = stores.find((s) => s.id === storeId);
  if (!store) return null;

  return {
    store,
    subscription: subscriptions.find((s) => s.storeId === storeId) ?? null,
    device: devices.find((d) => d.assignedStoreId === storeId) ?? null,
    transactions: transactions.filter((t) => t.storeId === storeId),
    tickets: tickets.filter((t) => t.storeId === storeId),
    auditEntries: auditEntries.filter((a) => a.store_id === storeId),
  };
}
