import { createClient } from "@/lib/supabase/server";
import type { NotificationCategory } from "@/types/admin";

export interface NotificationPreferencesData {
  subscriptionReminders: boolean;
  lowStock: boolean;
  creditOverdue: boolean;
  syncErrors: boolean;
  newSales: boolean;
}

const DEFAULTS: NotificationPreferencesData = {
  subscriptionReminders: true,
  lowStock: true,
  creditOverdue: true,
  syncErrors: true,
  newSales: false,
};

export async function fetchNotificationPreferences(profileId: string): Promise<NotificationPreferencesData> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (!data) return DEFAULTS;

  return {
    subscriptionReminders: data.subscription_reminders,
    lowStock: data.low_stock,
    creditOverdue: data.credit_overdue,
    syncErrors: data.sync_errors,
    newSales: data.new_sales,
  };
}

export interface NotificationLogEntry {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  status: "sent" | "failed";
  createdAt: string;
}

export async function fetchNotificationLogs(profileId: string, limit = 20): Promise<NotificationLogEntry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notification_logs")
    .select("id, category, title, body, status, created_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => ({
    id: row.id,
    category: row.category,
    title: row.title,
    body: row.body,
    status: row.status,
    createdAt: row.created_at,
  }));
}
