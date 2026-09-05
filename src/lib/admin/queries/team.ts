import { createClient } from "@/lib/supabase/server";

/** Lightweight id/name list of internal admin team members, for agent-assignment dropdowns. */
export async function fetchTeamOptions(): Promise<{ id: string; name: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "platform_admin")
    .order("full_name");
  if (error) throw new Error(`Pa t kapab chaje ekip la: ${error.message}`);
  return (data ?? []).map((p) => ({ id: p.id, name: p.full_name }));
}
