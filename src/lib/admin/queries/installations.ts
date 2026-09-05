import { createClient } from "@/lib/supabase/server";
import type { Installation, InstallationChecklistItem } from "@/types/admin";

interface InstallationRow {
  id: string;
  store_id: string | null;
  lead_id: string | null;
  store_name: string;
  contact: string | null;
  address: string | null;
  scheduled_at: string | null;
  agent_id: string | null;
  device_id: string | null;
  status: string;
  products_to_import: number | null;
  checklist: InstallationChecklistItem[];
  photo_count: number;
  client_signature: boolean;
  training_result: string | null;
  next_action: string | null;
  agent: { full_name: string } | { full_name: string }[] | null;
  device: { device_code: string } | { device_code: string }[] | null;
}

export async function fetchInstallations(): Promise<Installation[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("installations")
    .select("*, agent:profiles!installations_agent_id_fkey(full_name), device:devices(device_code)")
    .order("scheduled_at", { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error(`Pa t kapab chaje enstalasyon yo: ${error.message}`);
  }

  return ((data ?? []) as InstallationRow[]).map((row) => {
    const agent = Array.isArray(row.agent) ? row.agent[0] : row.agent;
    const device = Array.isArray(row.device) ? row.device[0] : row.device;
    return {
      id: row.id,
      storeId: row.store_id,
      leadId: row.lead_id,
      storeName: row.store_name,
      contact: row.contact ?? "—",
      address: row.address ?? "—",
      scheduledAt: row.scheduled_at,
      agentName: agent?.full_name ?? "Pa asiyen",
      deviceId: device?.device_code ?? null,
      status: row.status as Installation["status"],
      productsToImport: row.products_to_import,
      checklist: row.checklist ?? [],
      photoCount: row.photo_count,
      clientSignature: row.client_signature,
      trainingResult: row.training_result,
      nextAction: row.next_action,
    };
  });
}
