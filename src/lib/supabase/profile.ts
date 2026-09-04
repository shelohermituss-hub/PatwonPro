import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

/**
 * Reads the signed-in user's profile (role, store_id) for use in Server
 * Components/layouts. Returns null if there's no session or no profile
 * row yet (e.g. a freshly-registered auth user before `register_owner`
 * has run).
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return profile;
}
