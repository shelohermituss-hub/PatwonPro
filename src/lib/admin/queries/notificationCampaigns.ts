import { createClient } from "@/lib/supabase/server";
import type { NotificationCampaign } from "@/types/admin";

interface CampaignRow {
  id: string;
  title: string;
  body: string;
  target_scope: NotificationCampaign["targetScope"];
  target_store_id: string | null;
  trigger_type: NotificationCampaign["triggerType"];
  scheduled_at: string | null;
  cron_expression: string | null;
  status: NotificationCampaign["status"];
  created_by: string;
  created_at: string;
  last_dispatched_at: string | null;
  store: { name: string } | { name: string }[] | null;
  creator: { full_name: string } | { full_name: string }[] | null;
}

export async function fetchNotificationCampaigns(): Promise<NotificationCampaign[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notification_campaigns")
    .select(
      "id, title, body, target_scope, target_store_id, trigger_type, scheduled_at, cron_expression, status, created_by, created_at, last_dispatched_at, store:stores(name), creator:profiles!created_by(full_name)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Pa t kapab chaje kanpay notifikasyon yo: ${error.message}`);
  }

  return ((data ?? []) as CampaignRow[]).map((row) => {
    const store = Array.isArray(row.store) ? row.store[0] : row.store;
    const creator = Array.isArray(row.creator) ? row.creator[0] : row.creator;
    return {
      id: row.id,
      title: row.title,
      body: row.body,
      targetScope: row.target_scope,
      targetStoreId: row.target_store_id,
      targetStoreName: store?.name ?? null,
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

export interface StoreOption {
  id: string;
  name: string;
}

export async function fetchStoreOptions(): Promise<StoreOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("stores").select("id, name").order("name");
  if (error) {
    throw new Error(`Pa t kapab chaje lis boutik yo: ${error.message}`);
  }
  return data ?? [];
}
