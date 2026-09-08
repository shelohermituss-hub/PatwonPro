import { fetchNotificationCampaigns, fetchStoreOptions } from "@/lib/admin/queries/notificationCampaigns";
import { ensureScheduledAlertsCron } from "@/lib/admin/actions/notificationCampaigns";
import { NotificationsClient } from "./NotificationsClient";
import { requireNavAccess } from "@/lib/admin/guardNav";

export default async function NotificationsPage() {
  await requireNavAccess("notifications");
  const [campaigns, storeOptions] = await Promise.all([fetchNotificationCampaigns(), fetchStoreOptions()]);
  // Idempotent — self-heals the daily alerts cron job against this
  // deployment's current URL on every visit (see the function's own doc).
  void ensureScheduledAlertsCron();
  return <NotificationsClient campaigns={campaigns} storeOptions={storeOptions} />;
}
