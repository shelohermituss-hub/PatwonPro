import { fetchAdminSupportTickets } from "@/lib/admin/queries/support";
import { SupportClient } from "./SupportClient";

export default async function SupportPage() {
  const tickets = await fetchAdminSupportTickets();
  return <SupportClient tickets={tickets} />;
}
