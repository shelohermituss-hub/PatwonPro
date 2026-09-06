import { fetchAdminDevices } from "@/lib/admin/queries/devices";
import { fetchStoreOptions } from "@/lib/admin/queries/stores";
import { fetchPlatformSettings } from "@/lib/admin/queries/settings";
import { fetchPendingReplacementRequests } from "@/lib/admin/queries/replacementRequests";
import { DevicesClient } from "./DevicesClient";
import { requireNavAccess } from "@/lib/admin/guardNav";

export default async function DevicesPage() {
  await requireNavAccess("devices");
  const [devices, storeOptions, settings, replacementRequests] = await Promise.all([
    fetchAdminDevices(),
    fetchStoreOptions(),
    fetchPlatformSettings(),
    fetchPendingReplacementRequests(),
  ]);
  return (
    <DevicesClient
      devices={devices}
      storeOptions={storeOptions}
      defaultDepositAmountHtg={settings.depositAmountHtg}
      replacementRequests={replacementRequests}
    />
  );
}
