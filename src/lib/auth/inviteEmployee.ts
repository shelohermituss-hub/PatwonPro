"use server";

import { headers } from "next/headers";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { isOwner } from "@/lib/auth/roles";
import { inviteEmployeeSchema } from "@/lib/validations/invite";

export interface InviteEmployeeResult {
  error: string | null;
}

/**
 * Invites a new employee to the current owner's store by email. Re-verifies
 * `isOwner` server-side (never trust that the request came from the
 * owner-only settings form) and stamps `app_metadata` — never
 * `user_metadata`, which a client can rewrite via `auth.updateUser()` — with
 * the invited store/role, since `app_metadata` is the only channel a client
 * can't forge (see 00000000000009_accept_employee_invite.sql).
 */
export async function inviteEmployee(input: {
  email: string;
}): Promise<InviteEmployeeResult> {
  const parsed = inviteEmployeeSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Antre yon imèl valid." };
  }

  const profile = await getCurrentProfile();
  if (!isOwner(profile) || !profile?.store_id) {
    return { error: "Ou pa gen dwa envite anplwaye." };
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
    app_metadata: { invited_store_id: profile.store_id, invited_role: "employee" },
  });

  if (metadataError) {
    return {
      error: "Envitasyon voye, men nou pa t ka konfigire wòl la. Kontakte sipò.",
    };
  }

  return { error: null };
}
