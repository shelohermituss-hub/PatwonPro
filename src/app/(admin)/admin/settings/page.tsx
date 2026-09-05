import { fetchPlatformSettings } from "@/lib/admin/queries/settings";
import { SettingsClient } from "./SettingsClient";

export default async function AdminSettingsPage() {
  const settings = await fetchPlatformSettings();
  return <SettingsClient settings={settings} />;
}
