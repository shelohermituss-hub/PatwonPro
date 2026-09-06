import { createClient } from "@/lib/supabase/client";
import { INSTALLATION_CHECKLIST_TEMPLATE } from "@/lib/admin/installationChecklist";
import type { InstallationFormOutput } from "@/lib/validations/installation";
import type { InstallationChecklistItem, InstallationStatus } from "@/types/admin";

export async function createInstallation(input: InstallationFormOutput): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("installations")
    .insert({
      store_name: input.storeName,
      lead_id: input.leadId || null,
      contact: input.contact || null,
      address: input.address || null,
      scheduled_at: input.scheduledAt || null,
      agent_id: input.agentId || null,
      device_id: input.deviceId || null,
      checklist: INSTALLATION_CHECKLIST_TEMPLATE,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function updateInstallationPhotoCount(installationId: string, photoCount: number) {
  const supabase = createClient();
  const { error } = await supabase.from("installations").update({ photo_count: photoCount }).eq("id", installationId);
  if (error) throw new Error(error.message);
}

export async function updateInstallationSignature(installationId: string, clientSignature: boolean) {
  const supabase = createClient();
  const { error } = await supabase
    .from("installations")
    .update({ client_signature: clientSignature })
    .eq("id", installationId);
  if (error) throw new Error(error.message);
}

export async function updateInstallationChecklist(installationId: string, checklist: InstallationChecklistItem[]) {
  const supabase = createClient();
  const { error } = await supabase.from("installations").update({ checklist }).eq("id", installationId);
  if (error) throw new Error(error.message);
}

export async function updateInstallationStatus(installationId: string, status: InstallationStatus) {
  const supabase = createClient();
  const { error } = await supabase.from("installations").update({ status }).eq("id", installationId);
  if (error) throw new Error(error.message);
}
