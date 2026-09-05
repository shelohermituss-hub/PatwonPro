import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { TeamMember } from "@/types/admin";

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

/**
 * Full team roster for `/admin/team` — email and last sign-in live on
 * `auth.users`, not `profiles`, so this needs the service-role client.
 * The team is small (internal staff only), so one `getUserById` per
 * member is fine — no need for `listUsers()` pagination logic.
 */
export async function fetchTeamMembers(): Promise<TeamMember[]> {
  const supabase = await createClient();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, admin_role")
    .eq("role", "platform_admin")
    .order("full_name");

  if (error) throw new Error(`Pa t kapab chaje ekip la: ${error.message}`);

  const admin = createAdminClient();

  const members = await Promise.all(
    (profiles ?? []).map(async (p): Promise<TeamMember> => {
      const { data } = await admin.auth.admin.getUserById(p.id);
      return {
        id: p.id,
        name: p.full_name,
        email: data.user?.email ?? "—",
        role: (p.admin_role as TeamMember["role"]) ?? "read_only",
        lastLoginAt: data.user?.last_sign_in_at ?? null,
      };
    }),
  );

  return members;
}
