import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Exchanges an invite/magic-link code for a session (PKCE flow, per
 * @supabase/ssr's App Router docs) and lands the user wherever the link
 * asked for — `/accept-invite` for an employee invite, `/dashboard`
 * otherwise. Reachable without a session (see the `/auth/` bypass in
 * src/lib/supabase/middleware.ts) since there's no session yet when this
 * request arrives.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
