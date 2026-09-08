import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface PushSubscriptionJson {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/**
 * Registers (or refreshes) the calling user's Web Push subscription.
 * Uses the request's own session — `push_subscriptions_write_self`
 * RLS already scopes this to the caller's own `profile_id`.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Ou dwe konekte." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as PushSubscriptionJson | null;
  if (!body?.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return NextResponse.json({ error: "Abònman push la pa valid." }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("store_id")
    .eq("id", user.id)
    .maybeSingle();

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      profile_id: user.id,
      store_id: profile?.store_id ?? null,
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
      user_agent: request.headers.get("user-agent"),
    },
    { onConflict: "endpoint" },
  );

  if (error) {
    return NextResponse.json({ error: "Nou pa t ka anrejistre abònman an." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
