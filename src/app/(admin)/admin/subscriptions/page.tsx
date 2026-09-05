import { fetchAdminSubscriptions } from "@/lib/admin/queries/subscriptions";
import { SubscriptionsClient } from "./SubscriptionsClient";

export default async function SubscriptionsPage() {
  const subscriptions = await fetchAdminSubscriptions();
  return <SubscriptionsClient subscriptions={subscriptions} />;
}
