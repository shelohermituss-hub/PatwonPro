import { fetchDeposits } from "@/lib/admin/queries/deposits";
import { fetchStoreOptions } from "@/lib/admin/queries/stores";
import { fetchAdminDevices } from "@/lib/admin/queries/devices";
import { DepositsClient } from "./DepositsClient";

export default async function DepositsPage() {
  const [deposits, storeOptions, devices] = await Promise.all([
    fetchDeposits(),
    fetchStoreOptions(),
    fetchAdminDevices(),
  ]);

  const deviceOptions = devices.map((d) => ({ id: d.dbId, label: `${d.id} — ${d.brand} ${d.model}` }));

  return <DepositsClient deposits={deposits} storeOptions={storeOptions} deviceOptions={deviceOptions} />;
}
