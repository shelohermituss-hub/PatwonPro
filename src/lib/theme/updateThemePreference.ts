"use server";

import { getCurrentProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import type { ThemePreference } from "@/types";

/**
 * Best-effort cross-device persistence for the theme toggle —
 * `next-themes` already wrote the choice to `localStorage`
 * synchronously, so a failure here (e.g. offline) is silent: the
 * device the user is on already reflects the change, and the next
 * online theme change will resync the profile.
 */
export async function updateThemePreference(theme: ThemePreference): Promise<void> {
  const profile = await getCurrentProfile();
  if (!profile) return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ theme_preference: theme }).eq("id", profile.id);
}
