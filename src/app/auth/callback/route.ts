import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Exchanges an invite/magic-link/OAuth code for a session (PKCE flow, per
 * @supabase/ssr's App Router docs). Reachable without a session (see the
 * `/auth/` bypass in src/lib/supabase/middleware.ts) since there's no
 * session yet when this request arrives.
 *
 * Where it lands next depends on what kind of account this is, since an
 * explicit `next` param (invite links) is the only case that already
 * knows — a fresh Google/Facebook/Apple sign-in never has one:
 *  - `next` param present (employee/admin invite link) → there.
 *  - profile already exists → role-based landing, same as /login.
 *  - no profile, but `app_metadata.invited_store_id` or
 *    `invited_admin_role` is set (invite accepted via OAuth instead of
 *    the emailed magic link) → /accept-invite.
 *  - no profile, no invite claim (first-time OAuth sign-up) →
 *    /onboarding to create their own store.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (next) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      const user = data.user;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        const destination = profile.role === "platform_admin" ? "/admin" : "/dashboard";
        return NextResponse.redirect(`${origin}${destination}`);
      }

      const appMetadata = user.app_metadata as Record<string, unknown> | undefined;
      const hasInvite = appMetadata?.invited_store_id || appMetadata?.invited_admin_role;
      const destination = hasInvite ? "/accept-invite" : "/onboarding";
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
