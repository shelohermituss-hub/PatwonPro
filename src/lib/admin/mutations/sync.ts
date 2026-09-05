import { createClient } from "@/lib/supabase/client";

/**
 * Creates a real P1 support ticket from a sync-error row. `created_by`
 * must reference a real profile — the admin's own id, since there's no
 * "system" actor in `profiles`.
 */
export async function createSyncTicket(storeId: string, deviceCode: string, actorId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("support_tickets").insert({
    store_id: storeId,
    created_by: actorId,
    subject: `Erè senkwonizasyon — tablèt ${deviceCode}`,
    message: `Tablèt ${deviceCode} gen erè senkwonizasyon ki bezwen enspeksyon.`,
    category: "connectivity_sync",
    priority: "P1",
  });
  if (error) throw new Error(error.message);
}
