"use server";

import { headers } from "next/headers";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPlatformAdmin } from "@/lib/auth/roles";

/**
 * Sends a real password-reset email to a store owner — needs the
 * service-role client because looking up a user's email by id
 * (`auth.admin.getUserById`) isn't available to a normal client.
 */
export async function resetStoreOwnerPassword(storeId: string): Promise<{ error: string | null }> {
  const profile = await getCurrentProfile();
  if (!isPlatformAdmin(profile)) {
    return { error: "Ou pa gen dwa fè aksyon sa a." };
  }

  const supabase = await createClient();
  const { data: store } = await supabase
    .from("stores")
    .select("owner_id")
    .eq("id", storeId)
    .maybeSingle();

  if (!store) {
    return { error: "Boutik la pa jwenn." };
  }

  const admin = createAdminClient();
  const { data: userData, error: userError } = await admin.auth.admin.getUserById(store.owner_id);

  if (userError || !userData.user?.email) {
    return { error: "Nou pa t ka jwenn imèl pwopriyetè a." };
  }

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const redirectTo = `${protocol}://${host}/auth/callback?next=/dashboard`;

  const { error } = await admin.auth.resetPasswordForEmail(userData.user.email, { redirectTo });

  if (error) {
    return { error: "Nou pa t ka voye lyen reyinisyalizasyon an." };
  }

  return { error: null };
}
