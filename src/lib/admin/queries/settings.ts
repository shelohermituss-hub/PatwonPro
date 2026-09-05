import { createClient } from "@/lib/supabase/server";

export interface PlatformSettingsData {
  planPricesHtg: { starter: number; standard: number; pro: number };
  depositAmountHtg: number;
  gracePeriodDays: number;
  slaP1Label: string;
}

const DEFAULTS: PlatformSettingsData = {
  planPricesHtg: { starter: 1200, standard: 1800, pro: 2500 },
  depositAmountHtg: 6000,
  gracePeriodDays: 7,
  slaP1Label: "Menm jou",
};

export async function fetchPlatformSettings(): Promise<PlatformSettingsData> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("platform_settings").select("key, value");

  if (error) {
    throw new Error(`Pa t kapab chaje paramèt platfòm yo: ${error.message}`);
  }

  const byKey = new Map((data ?? []).map((row) => [row.key, row.value]));

  return {
    planPricesHtg: (byKey.get("plan_prices_htg") as PlatformSettingsData["planPricesHtg"]) ?? DEFAULTS.planPricesHtg,
    depositAmountHtg: (byKey.get("deposit_amount_htg") as number) ?? DEFAULTS.depositAmountHtg,
    gracePeriodDays: (byKey.get("grace_period_days") as number) ?? DEFAULTS.gracePeriodDays,
    slaP1Label: (byKey.get("sla_p1_label") as string) ?? DEFAULTS.slaP1Label,
  };
}
