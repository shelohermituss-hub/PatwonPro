import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { fetchSubscriptionData } from "@/lib/subscription/queries";
import { SubscriptionSummaryCard } from "@/components/subscription/SubscriptionSummaryCard";
import { DeviceList } from "@/components/subscription/DeviceList";
import { SupportTicketList } from "@/components/subscription/SupportTicketList";
import { NewSupportTicketSheet } from "@/components/subscription/NewSupportTicketSheet";

export default async function SubscriptionPage() {
  const profile = await getCurrentProfile();

  if (!profile?.store_id) {
    redirect("/dashboard");
  }

  const { subscription, devices, tickets } = await fetchSubscriptionData(
    profile.store_id,
  );

  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-foreground">
          Abònman, Tablèt ak Sipò
        </h1>
        <p className="text-text-secondary">
          Vi abònman boutik ou, aparèy anrejistre yo, ak tikè sipò.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Abònman</h2>
        <SubscriptionSummaryCard subscription={subscription} />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Tablèt</h2>
        <DeviceList devices={devices} />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Sipò</h2>
          <NewSupportTicketSheet storeId={profile.store_id} employeeId={profile.id} />
        </div>
        <SupportTicketList tickets={tickets} />
      </div>
    </div>
  );
}
