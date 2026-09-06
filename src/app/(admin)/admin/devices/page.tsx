import { fetchAdminDevices } from "@/lib/admin/queries/devices";
import { fetchStoreOptions } from "@/lib/admin/queries/stores";
import { fetchPlatformSettings } from "@/lib/admin/queries/settings";
import { DevicesClient } from "./DevicesClient";
import { requireNavAccess } from "@/lib/admin/guardNav";

export default async function DevicesPage() {
  await requireNavAccess("devices");
  const [devices, storeOptions, settings] = await Promise.all([
    fetchAdminDevices(),
    fetchStoreOptions(),
    fetchPlatformSettings(),
  ]);
  return (
    <DevicesClient
      devices={devices}
      storeOptions={storeOptions}
      defaultDepositAmountHtg={settings.depositAmountHtg}
    />
  );
}
