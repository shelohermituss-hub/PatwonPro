import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import { isPlatformAdmin } from "@/lib/auth/roles";
import { OnboardingForm } from "./OnboardingForm";

/**
 * Lands a brand-new Google/Facebook/Apple sign-in here (see
 * src/app/auth/callback/route.ts) to collect the one thing OAuth doesn't
 * ask for: their store's name. Redirects away if a profile already
 * exists — this route only makes sense for the one moment between a
 * fresh OAuth account and `register_owner()` running.
 */
export default async function OnboardingPage() {
  const profile = await getCurrentProfile();

  if (profile) {
    redirect(isPlatformAdmin(profile) ? "/admin" : "/dashboard");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const suggestedName =
    (user?.user_metadata as Record<string, unknown> | undefined)?.full_name ??
    (user?.user_metadata as Record<string, unknown> | undefined)?.name ??
    "";

  return <OnboardingForm defaultFullName={String(suggestedName)} />;
}
