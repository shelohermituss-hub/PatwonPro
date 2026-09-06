import { fetchAdminDevices } from "@/lib/admin/queries/devices";
import { fetchStoreOptions } from "@/lib/admin/queries/stores";
import { DevicesClient } from "./DevicesClient";

export default async function DevicesPage() {
  const [devices, storeOptions] = await Promise.all([fetchAdminDevices(), fetchStoreOptions()]);
  return <DevicesClient devices={devices} storeOptions={storeOptions} />;
}
