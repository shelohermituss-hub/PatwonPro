import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Called at the end of `syncAllPending()` so the admin sync-health page
 * (`/admin/sync`) has a real signal instead of `devices.last_seen_at`
 * sitting untouched forever. Updates every device row assigned to the
 * caller's store — most stores have exactly one tablet, so this is the
 * simplest real source without building per-physical-device
 * fingerprinting (out of scope for this phase).
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Ou dwe konekte." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("store_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.store_id) {
    return NextResponse.json({ error: "Nou pa jwenn boutik ou." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const pendingActions = Number.isFinite(body?.pendingCount) ? Math.max(0, Math.trunc(body.pendingCount)) : 0;
  const syncErrors = Number.isFinite(body?.errorCount) ? Math.max(0, Math.trunc(body.errorCount)) : 0;

  const { error } = await supabase
    .from("devices")
    .update({
      last_seen_at: new Date().toISOString(),
      pending_actions: pendingActions,
      sync_errors: syncErrors,
    })
    .eq("store_id", profile.store_id);

  if (error) {
    return NextResponse.json({ error: "Nou pa t ka anrejistre eta sync la." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
