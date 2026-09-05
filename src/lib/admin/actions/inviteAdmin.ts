"use server";

import { headers } from "next/headers";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPlatformAdmin } from "@/lib/auth/roles";
import { can } from "@/lib/admin/permissions";
import { inviteAdminSchema } from "@/lib/validations/invite";
import type { AdminRole } from "@/types/admin";

export interface InviteAdminResult {
  error: string | null;
}

/**
 * Invites a new internal admin by email — mirror of
 * `src/lib/auth/inviteEmployee.ts`, but stamps `invited_admin_role`
 * instead of `invited_store_id`/`invited_role` (see
 * 00000000000024_accept_admin_invite.sql). Re-verifies the caller is a
 * platform_admin with `manage_team` server-side; never trust that the
 * request came from someone with the button visible.
 */
export async function inviteAdmin(input: {
  email: string;
  adminRole: AdminRole;
}): Promise<InviteAdminResult> {
  const parsed = inviteAdminSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Antre yon imèl valid ak yon wòl." };
  }

  const profile = await getCurrentProfile();
  if (!profile || !isPlatformAdmin(profile) || !profile.admin_role || !can(profile.admin_role, "manage_team")) {
    return { error: "Ou pa gen dwa envite yon nouvo admin." };
  }

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const redirectTo = `${protocol}://${host}/auth/callback?next=/accept-invite`;

  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
    redirectTo,
  });

  if (error || !data.user) {
    return {
      error: error?.message.includes("already been registered")
        ? "Yon kont deja egziste ak imèl sa a."
        : "Nou pa t ka voye envitasyon an.",
    };
  }

  const { error: metadataError } = await admin.auth.admin.updateUserById(data.user.id, {
    app_metadata: { invited_admin_role: parsed.data.adminRole },
  });

  if (metadataError) {
    return {
      error: "Envitasyon voye, men nou pa t ka konfigire wòl la. Kontakte sipò.",
    };
  }

  return { error: null };
}
