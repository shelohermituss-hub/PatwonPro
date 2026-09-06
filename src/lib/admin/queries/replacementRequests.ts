import { createClient } from "@/lib/supabase/server";
import type { AdminReplacementRequest } from "@/types/admin";

interface ReplacementRequestRow {
  id: string;
  store_id: string;
  reason: string;
  created_at: string;
  store: { name: string } | { name: string }[] | null;
  device: { id: string; device_code: string | null } | { id: string; device_code: string | null }[] | null;
}

/**
 * Only the `pending` queue — once an admin resolves a request
 * (approved/rejected/completed) it drops off this list, same as
 * `fetchAdminSubscriptions`'s "needs attention" framing elsewhere.
 */
export async function fetchPendingReplacementRequests(): Promise<AdminReplacementRequest[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("replacement_requests")
    .select(
      "id, store_id, reason, created_at, store:stores(name), device:devices!replacement_requests_device_id_fkey(id, device_code)",
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Pa t kapab chaje demand ranplasman yo: ${error.message}`);
  }

  return ((data ?? []) as ReplacementRequestRow[]).map((row) => {
    const store = Array.isArray(row.store) ? row.store[0] : row.store;
    const device = Array.isArray(row.device) ? row.device[0] : row.device;
    return {
      id: row.id,
      storeId: row.store_id,
      storeName: store?.name ?? "—",
      deviceDbId: device?.id ?? "",
      deviceCode: device?.device_code ?? "—",
      reason: row.reason,
      createdAt: row.created_at,
    };
  });
}
