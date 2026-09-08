import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToProfileBulk } from "@/lib/push/send";

/**
 * Shared by `POST /api/push/dispatch` (called by `pg_cron` for
 * `scheduled_once`/`recurring` campaigns, no session at all) and
 * `createNotificationCampaign` (an `immediate` campaign dispatches
 * synchronously, no HTTP round-trip needed since it already runs
 * server-side with the same service-role access).
 */
export async function dispatchNotificationCampaign(campaignId: string) {
  const admin = createAdminClient();

  const { data: campaign } = await admin
    .from("notification_campaigns")
    .select("*")
    .eq("id", campaignId)
    .maybeSingle();

  if (!campaign) {
    return { ok: false as const, error: "Kanpay la pa jwenn." };
  }
  if (campaign.status === "canceled") {
    return { ok: true as const, skipped: "canceled" as const };
  }
  // A `scheduled_once` campaign already dispatched shouldn't resend if
  // its one-shot cron job somehow fires twice (clock drift, retry).
  if (campaign.trigger_type === "scheduled_once" && campaign.status === "sent") {
    return { ok: true as const, skipped: "already_sent" as const };
  }

  let targetProfileIds: string[] = [];

  if (campaign.target_scope === "admin_team") {
    const { data } = await admin.from("profiles").select("id").eq("role", "platform_admin");
    targetProfileIds = (data ?? []).map((p) => p.id);
  } else if (campaign.target_scope === "single_store" && campaign.target_store_id) {
    const { data } = await admin
      .from("profiles")
      .select("id")
      .eq("role", "owner")
      .eq("store_id", campaign.target_store_id);
    targetProfileIds = (data ?? []).map((p) => p.id);
  } else {
    const { data } = await admin.from("profiles").select("id").eq("role", "owner");
    targetProfileIds = (data ?? []).map((p) => p.id);
  }

  const result = await sendPushToProfileBulk(targetProfileIds, {
    category: "admin_broadcast",
    title: campaign.title,
    body: campaign.body,
  });

  await admin
    .from("notification_campaigns")
    .update({
      last_dispatched_at: new Date().toISOString(),
      status: campaign.trigger_type === "recurring" ? "scheduled" : "sent",
    })
    .eq("id", campaign.id);

  if (campaign.trigger_type === "scheduled_once") {
    await admin.rpc("unschedule_notification_campaign_cron", { campaign_id: campaign.id });
  }

  return { ok: true as const, ...result };
}
