import { createClient } from "@/lib/supabase/client";
import type { AdminRole } from "@/types/admin";

/** RLS + the `profiles_enforce_admin_role_change` trigger both require `manage_team` (super_admin). */
export async function changeAdminRole(profileId: string, role: AdminRole) {
  const supabase = createClient();
  const { error } = await supabase.from("profiles").update({ admin_role: role }).eq("id", profileId);
  if (error) throw new Error(error.message);
}
