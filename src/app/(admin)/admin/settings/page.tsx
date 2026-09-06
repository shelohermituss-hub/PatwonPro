import { fetchPlatformSettings } from "@/lib/admin/queries/settings";
import { SettingsClient } from "./SettingsClient";

export default async function AdminSettingsPage() {
  const settings = await fetchPlatformSettings();
  const envClientIdConfigured = Boolean(process.env.PAYMENT_GATEWAY_CLIENT_ID);
  return <SettingsClient settings={settings} envClientIdConfigured={envClientIdConfigured} />;
}
