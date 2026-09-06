import { fetchAdminSubscriptions } from "@/lib/admin/queries/subscriptions";
import { SubscriptionsClient } from "./SubscriptionsClient";
import { requireNavAccess } from "@/lib/admin/guardNav";

export default async function SubscriptionsPage() {
  await requireNavAccess("subscriptions");
  const subscriptions = await fetchAdminSubscriptions();
  return <SubscriptionsClient subscriptions={subscriptions} />;
}
