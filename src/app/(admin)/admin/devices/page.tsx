import { fetchAdminDevices } from "@/lib/admin/queries/devices";
import { DevicesClient } from "./DevicesClient";

export default async function DevicesPage() {
  const devices = await fetchAdminDevices();
  return <DevicesClient devices={devices} />;
}
