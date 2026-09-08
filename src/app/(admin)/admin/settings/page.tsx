import { fetchPlatformSettings } from "@/lib/admin/queries/settings";
import { fetchNotificationPreferences, fetchNotificationLogs } from "@/lib/notifications/queries";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { SettingsClient } from "./SettingsClient";
import { requireNavAccess } from "@/lib/admin/guardNav";

export default async function AdminSettingsPage() {
  await requireNavAccess("settings");
  const profile = await getCurrentProfile();
  const [settings, notificationPreferences, notificationLogs] = await Promise.all([
    fetchPlatformSettings(),
    profile ? fetchNotificationPreferences(profile.id) : null,
    profile ? fetchNotificationLogs(profile.id) : null,
  ]);
  const envClientIdConfigured = Boolean(process.env.PAYMENT_GATEWAY_CLIENT_ID);
  return (
    <SettingsClient
      settings={settings}
      envClientIdConfigured={envClientIdConfigured}
      profileId={profile?.id ?? null}
      notificationPreferences={notificationPreferences}
      notificationLogs={notificationLogs ?? []}
    />
  );
}
