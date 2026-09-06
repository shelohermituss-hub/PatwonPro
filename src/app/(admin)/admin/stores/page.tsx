import { fetchAdminStores } from "@/lib/admin/queries/stores";
import { StoresClient } from "./StoresClient";
import { requireNavAccess } from "@/lib/admin/guardNav";

export default async function StoresPage() {
  await requireNavAccess("stores");
  const stores = await fetchAdminStores();
  return <StoresClient stores={stores} />;
}
