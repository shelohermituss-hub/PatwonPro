import { fetchAdminStores } from "@/lib/admin/queries/stores";
import { StoresClient } from "./StoresClient";

export default async function StoresPage() {
  const stores = await fetchAdminStores();
  return <StoresClient stores={stores} />;
}
