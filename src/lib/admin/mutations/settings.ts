import { createClient } from "@/lib/supabase/client";
import type { PlatformSettingsData } from "@/lib/admin/queries/settings";

/** RLS `platform_settings_write_admin` requires `admin_can('manage_settings')` — super_admin only. */
export async function savePlatformSettings(settings: PlatformSettingsData) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const updated_by = userData.user?.id ?? null;

  const { error } = await supabase.from("platform_settings").upsert([
    { key: "plan_prices_htg", value: settings.planPricesHtg, updated_by },
    { key: "deposit_amount_htg", value: settings.depositAmountHtg, updated_by },
    { key: "grace_period_days", value: settings.gracePeriodDays, updated_by },
    { key: "sla_p1_label", value: settings.slaP1Label, updated_by },
  ]);

  if (error) throw new Error(error.message);
}
