import { fetchAdminDevices } from "@/lib/admin/queries/devices";
import { fetchStoreOptions } from "@/lib/admin/queries/stores";
import { DevicesClient } from "./DevicesClient";
import { requireNavAccess } from "@/lib/admin/guardNav";

export default async function DevicesPage() {
  await requireNavAccess("devices");
  const [devices, storeOptions] = await Promise.all([fetchAdminDevices(), fetchStoreOptions()]);
  return <DevicesClient devices={devices} storeOptions={storeOptions} />;
}
