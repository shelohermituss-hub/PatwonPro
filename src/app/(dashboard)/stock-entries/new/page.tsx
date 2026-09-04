import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { isOwner } from "@/lib/auth/roles";
import { StockEntryForm } from "@/components/StockEntryForm";

export default async function NewStockEntryPage() {
  const profile = await getCurrentProfile();

  if (!isOwner(profile)) {
    redirect("/stock-entries");
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-foreground">
          Nouvo Antre Stòk
        </h1>
        <p className="text-text-secondary">
          Anrejistre yon rapwovizyonman, yon korije, oswa yon ajisteman. Li
          disponib imedyatman, menm san entènèt.
        </p>
      </div>

      <StockEntryForm />
    </div>
  );
}
