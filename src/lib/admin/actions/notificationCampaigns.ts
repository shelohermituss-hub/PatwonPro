"use server";

import { headers } from "next/headers";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import { isPlatformAdmin } from "@/lib/auth/roles";
import { can } from "@/lib/admin/permissions";
import { dispatchNotificationCampaign } from "@/lib/notifications/dispatchCampaign";
import type {
  NotificationCampaignTargetScope,
  NotificationCampaignTriggerType,
} from "@/types/admin";

export interface CreateNotificationCampaignInput {
  title: string;
  body: string;
  targetScope: NotificationCampaignTargetScope;
  targetStoreId: string | null;
  triggerType: NotificationCampaignTriggerType;
  /** Required for `scheduled_once` — UTC minute/hour/day/month are read off this Date. */
  scheduledAt: string | null;
  /** Required for `recurring` — a standard 5-field cron expression, translated from the frequency picker client-side. */
  cronExpression: string | null;
}

async function requireNotificationsAdmin() {
  const profile = await getCurrentProfile();
  if (!profile || !isPlatformAdmin(profile) || !profile.admin_role || !can(profile.admin_role, "manage_notifications")) {
    return null;
  }
  return profile;
}

async function getDispatchUrl(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}/api/push/dispatch`;
}

function toOneShotCronExpression(iso: string): string {
  const date = new Date(iso);
  return `${date.getUTCMinutes()} ${date.getUTCHours()} ${date.getUTCDate()} ${date.getUTCMonth() + 1} *`;
}

export async function createNotificationCampaign(
  input: CreateNotificationCampaignInput,
): Promise<{ error: string | null; campaignId: string | null }> {
  const profile = await requireNotificationsAdmin();
  if (!profile) {
    return { error: "Ou pa gen dwa jere notifikasyon yo.", campaignId: null };
  }
  if (input.triggerType === "scheduled_once" && !input.scheduledAt) {
    return { error: "Chwazi yon dat pou kanpay pwograme a.", campaignId: null };
  }
  if (input.triggerType === "recurring" && !input.cronExpression) {
    return { error: "Chwazi yon frekans pou kanpay repetitif la.", campaignId: null };
  }
  if (input.targetScope === "single_store" && !input.targetStoreId) {
    return { error: "Chwazi yon boutik.", campaignId: null };
  }

  const supabase = await createClient();
  const { data: inserted, error: insertError } = await supabase
    .from("notification_campaigns")
    .insert({
      title: input.title,
      body: input.body,
      target_scope: input.targetScope,
      target_store_id: input.targetScope === "single_store" ? input.targetStoreId : null,
      trigger_type: input.triggerType,
      scheduled_at: input.triggerType === "scheduled_once" ? input.scheduledAt : null,
      cron_expression: input.triggerType === "recurring" ? input.cronExpression : null,
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return { error: "Nou pa t ka kreye kanpay la.", campaignId: null };
  }

  const campaignId = inserted.id as string;

  if (input.triggerType === "immediate") {
    await dispatchNotificationCampaign(campaignId);
  } else {
    const cronExpr = input.triggerType === "scheduled_once" ? toOneShotCronExpression(input.scheduledAt!) : input.cronExpression!;
    const { error: scheduleError } = await supabase.rpc("schedule_notification_campaign_cron", {
      campaign_id: campaignId,
      cron_expr: cronExpr,
      dispatch_url: await getDispatchUrl(),
      dispatch_secret: process.env.PUSH_DISPATCH_SECRET ?? "",
    });
    if (scheduleError) {
      await supabase.from("notification_campaigns").delete().eq("id", campaignId);
      return { error: "Nou pa t ka pwograme kanpay la — verifye pg_cron aktive.", campaignId: null };
    }
    await supabase.from("notification_campaigns").update({ status: "scheduled" }).eq("id", campaignId);
  }

  await supabase.from("audit_logs").insert({
    actor_id: profile.id,
    actor_role: profile.admin_role,
    action: "notification_campaign.created",
    resource_type: "notification_campaign",
    resource_id: campaignId,
    metadata: { triggerType: input.triggerType, targetScope: input.targetScope },
  });

  return { error: null, campaignId };
}

export async function deleteNotificationCampaign(campaignId: string): Promise<{ error: string | null }> {
  const profile = await requireNotificationsAdmin();
  if (!profile) {
    return { error: "Ou pa gen dwa jere notifikasyon yo." };
  }

  const supabase = await createClient();
  const { data: campaign } = await supabase
    .from("notification_campaigns")
    .select("trigger_type")
    .eq("id", campaignId)
    .maybeSingle();

  if (campaign && campaign.trigger_type !== "immediate") {
    await supabase.rpc("unschedule_notification_campaign_cron", { campaign_id: campaignId });
  }

  const { error } = await supabase.from("notification_campaigns").delete().eq("id", campaignId);
  if (error) {
    return { error: "Nou pa t ka efase kanpay la." };
  }

  await supabase.from("audit_logs").insert({
    actor_id: profile.id,
    actor_role: profile.admin_role,
    action: "notification_campaign.deleted",
    resource_type: "notification_campaign",
    resource_id: campaignId,
  });

  return { error: null };
}

/**
 * Idempotently (re)schedules the daily low-stock/overdue-credit check
 * against this deployment's own current URL — called from
 * `/admin/notifications` on every load so it self-heals across
 * redeploys/domain changes instead of needing a one-time manual step.
 */
export async function ensureScheduledAlertsCron(): Promise<void> {
  const profile = await requireNotificationsAdmin();
  if (!profile) return;

  const supabase = await createClient();
  await supabase.rpc("ensure_scheduled_alerts_cron", {
    dispatch_url: await getDispatchUrl(),
    dispatch_secret: process.env.PUSH_DISPATCH_SECRET ?? "",
  });
}
