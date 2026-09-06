import { fetchPlatformSettings } from "@/lib/admin/queries/settings";
import { SettingsClient } from "./SettingsClient";
import { requireNavAccess } from "@/lib/admin/guardNav";

export default async function AdminSettingsPage() {
  await requireNavAccess("settings");
  const settings = await fetchPlatformSettings();
  const envClientIdConfigured = Boolean(process.env.PAYMENT_GATEWAY_CLIENT_ID);
  return <SettingsClient settings={settings} envClientIdConfigured={envClientIdConfigured} />;
}
