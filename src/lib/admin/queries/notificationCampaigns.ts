import { createClient } from "@/lib/supabase/server";
import type { NotificationCampaign } from "@/types/admin";

interface CampaignRow {
  id: string;
  title: string;
  body: string;
  category: string;
  notification_type: NotificationCampaign["notificationType"];
  target_scope: NotificationCampaign["targetScope"];
  target_profile_id: string | null;
  trigger_type: NotificationCampaign["triggerType"];
  scheduled_at: string | null;
  cron_expression: string | null;
  status: NotificationCampaign["status"];
  created_by: string;
  created_at: string;
  last_dispatched_at: string | null;
  target_profile: { full_name: string } | { full_name: string }[] | null;
  creator: { full_name: string } | { full_name: string }[] | null;
}

export async function fetchNotificationCampaigns(): Promise<NotificationCampaign[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notification_campaigns")
    .select(
      "id, title, body, category, notification_type, target_scope, target_profile_id, trigger_type, scheduled_at, cron_expression, status, created_by, created_at, last_dispatched_at, target_profile:profiles!target_profile_id(full_name), creator:profiles!created_by(full_name)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Pa t kapab chaje kanpay notifikasyon yo: ${error.message}`);
  }

  return ((data ?? []) as CampaignRow[]).map((row) => {
    const targetProfile = Array.isArray(row.target_profile) ? row.target_profile[0] : row.target_profile;
    const creator = Array.isArray(row.creator) ? row.creator[0] : row.creator;
    return {
      id: row.id,
      title: row.title,
      body: row.body,
      category: row.category,
      notificationType: row.notification_type,
      targetScope: row.target_scope,
      targetProfileId: row.target_profile_id,
      targetProfileName: targetProfile?.full_name ?? null,
      triggerType: row.trigger_type,
      scheduledAt: row.scheduled_at,
      cronExpression: row.cron_expression,
      status: row.status,
      createdBy: row.created_by,
      createdByName: creator?.full_name ?? null,
      createdAt: row.created_at,
      lastDispatchedAt: row.last_dispatched_at,
    };
  });
}

export interface UserOption {
  id: string;
  fullName: string;
  role: "owner" | "employee" | "platform_admin";
  storeName: string | null;
}

interface UserOptionRow {
  id: string;
  full_name: string;
  role: UserOption["role"];
  store: { name: string } | { name: string }[] | null;
}

/** Every profile a manual campaign can target — used by the "Yon Sèl Itilizatè" search list. */
export async function fetchUserOptions(): Promise<UserOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, store:stores(name)")
    .order("full_name");

  if (error) {
    throw new Error(`Pa t kapab chaje lis itilizatè yo: ${error.message}`);
  }

  return ((data ?? []) as UserOptionRow[]).map((row) => {
    const store = Array.isArray(row.store) ? row.store[0] : row.store;
    return {
      id: row.id,
      fullName: row.full_name,
      role: row.role,
      storeName: store?.name ?? null,
    };
  });
}
