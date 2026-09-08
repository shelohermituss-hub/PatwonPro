import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";
import type { NotificationCategory } from "@/types/admin";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT;

let vapidConfigured = false;
function ensureVapidConfigured() {
  if (vapidConfigured) return;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) {
    throw new Error("Kle VAPID yo pa konfigire (NEXT_PUBLIC_VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY/VAPID_SUBJECT).");
  }
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  vapidConfigured = true;
}

/**
 * Preference column gating each category — `null` means the category
 * always sends regardless of preference (an admin broadcast is a
 * deliberate one-off announcement, not a recurring alert to opt out of).
 * A profile with no `notification_preferences` row yet (never opened
 * the "Notifikasyon" settings tab) falls back to these same defaults
 * as the migration's column defaults, kept in sync manually here.
 */
const CATEGORY_PREF: Record<NotificationCategory, keyof PrefDefaults | null> = {
  subscription_reminder: "subscription_reminders",
  low_stock: "low_stock",
  credit_overdue: "credit_overdue",
  sync_error: "sync_errors",
  new_sale: "new_sales",
  refund: "new_sales",
  admin_broadcast: null,
};

interface PrefDefaults {
  subscription_reminders: boolean;
  low_stock: boolean;
  credit_overdue: boolean;
  sync_errors: boolean;
  new_sales: boolean;
}

const DEFAULT_PREFS: PrefDefaults = {
  subscription_reminders: true,
  low_stock: true,
  credit_overdue: true,
  sync_errors: true,
  new_sales: false,
};

export interface PushPayload {
  category: NotificationCategory;
  title: string;
  body: string;
  url?: string;
}

export interface SendResult {
  attempted: number;
  sent: number;
  skippedByPreference: boolean;
}

/**
 * Sends a push notification to every device a profile has subscribed
 * from, respecting that profile's category preference, and logs every
 * attempt (success or failure) to `notification_logs`. Always uses the
 * service-role client — called from contexts with no admin session at
 * all (sync heartbeat under an employee's session, `pg_cron`-triggered
 * dispatch with only a shared secret).
 */
export async function sendPushToProfile(profileId: string, payload: PushPayload): Promise<SendResult> {
  ensureVapidConfigured();
  const admin = createAdminClient();

  const prefKey = CATEGORY_PREF[payload.category];
  if (prefKey) {
    const { data: prefs } = await admin
      .from("notification_preferences")
      .select("*")
      .eq("profile_id", profileId)
      .maybeSingle();
    const enabled = prefs ? Boolean(prefs[prefKey]) : DEFAULT_PREFS[prefKey];
    if (!enabled) {
      return { attempted: 0, sent: 0, skippedByPreference: true };
    }
  }

  const { data: subscriptions } = await admin
    .from("push_subscriptions")
    .select("*")
    .eq("profile_id", profileId);

  const rows = subscriptions ?? [];
  let sent = 0;

  for (const sub of rows) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify({ title: payload.title, body: payload.body, url: payload.url ?? "/dashboard" }),
      );
      sent += 1;
      await admin.from("notification_logs").insert({
        profile_id: profileId,
        category: payload.category,
        title: payload.title,
        body: payload.body,
        status: "sent",
      });
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await admin.from("push_subscriptions").delete().eq("id", sub.id);
      }
      await admin.from("notification_logs").insert({
        profile_id: profileId,
        category: payload.category,
        title: payload.title,
        body: payload.body,
        status: "failed",
        error: error instanceof Error ? error.message : "Erè enkoni.",
      });
    }
  }

  return { attempted: rows.length, sent, skippedByPreference: false };
}

/**
 * Fans a single payload out to several profiles — used by the admin
 * notification campaign console for `all_stores`/`admin_team` broadcasts.
 */
export async function sendPushToProfileBulk(
  profileIds: string[],
  payload: PushPayload,
): Promise<{ profilesNotified: number; totalSent: number }> {
  let profilesNotified = 0;
  let totalSent = 0;

  for (const profileId of profileIds) {
    const result = await sendPushToProfile(profileId, payload);
    if (result.sent > 0) profilesNotified += 1;
    totalSent += result.sent;
  }

  return { profilesNotified, totalSent };
}
