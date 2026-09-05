import Link from "next/link";
import { Icons } from "@/lib/icons";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { fetchDashboardData } from "@/lib/dashboard/queries";
import { formatCurrencyHTG } from "@/lib/format";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KpiCard, type KpiTrend } from "@/components/dashboard/KpiCard";
import { RecentSalesPanel } from "@/components/dashboard/RecentSalesPanel";
import { SalesTrendChart } from "@/components/reports/SalesTrendChart";
import { LowStockPanel } from "@/components/reports/LowStockPanel";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  { href: "/sales/new", label: "Nouvo Vant", icon: Icons.pos },
  { href: "/products/new", label: "Ajoute Pwodwi", icon: Icons.add },
  { href: "/credits/new", label: "Nouvo Kredi", icon: Icons.credit },
];

/** Real day-over-day % — never fabricated where there's no baseline to compare. */
function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

function moneyTrend(current: number, previous: number, noBaselineLabel: string): KpiTrend {
  if (current === 0 && previous === 0) {
    return { tone: "neutral", icon: Icons.trendUp, label: noBaselineLabel };
  }
  const pct = pctChange(current, previous);
  if (pct === null) {
    return { tone: "positive", icon: Icons.trendUp, label: "Premye a depi ayè" };
  }
  const rounded = Math.round(pct);
  if (rounded === 0) return { tone: "neutral", icon: Icons.trendUp, label: "Menm nivo ak ayè" };
  return rounded > 0
    ? { tone: "positive", icon: Icons.trendUp, label: `+${rounded}% pase ayè` }
    : { tone: "negative", icon: Icons.trendDown, label: `${rounded}% pase ayè` };
}

export default async function DashboardPage() {
  const profile = await getCurrentProfile();

  if (!profile?.store_id) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <h1 className="text-2xl font-extrabold text-foreground">Tablo Bò</h1>
        <p className="text-text-secondary">
          Nou pa t ka jwenn boutik ou. Rekonekte epi eseye ankò.
        </p>
      </div>
    );
  }

  let data;
  try {
    data = await fetchDashboardData(profile.store_id);
  } catch {
    return (
      <div className="flex flex-col gap-4 p-6">
        <h1 className="text-2xl font-extrabold text-foreground">Tablo Bò</h1>
        <p className="text-text-secondary">
          Nou pa t ka chaje tablo bò a. Verifye koneksyon ou epi eseye ankò.
        </p>
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "outline" }), "w-fit min-h-11")}
        >
          Eseye ankò
        </Link>
      </div>
    );
  }

  const lowStockCount = data.lowStockProducts.length;

  const stockTrend: KpiTrend =
    data.outOfStockCount > 0
      ? { tone: "negative", icon: Icons.alert, label: `${data.outOfStockCount} san stòk nèt` }
      : lowStockCount > 0
        ? { tone: "neutral", icon: Icons.alert, label: "Bezwen reapwovizyone" }
        : { tone: "positive", icon: Icons.success, label: "Tout pwodwi ok" };

  const creditTrend: KpiTrend =
    data.creditCustomersCount > 0
      ? { tone: "neutral", icon: Icons.customers, label: `${data.creditCustomersCount} kliyan gen dèt` }
      : { tone: "positive", icon: Icons.success, label: "Pa gen dèt kliyan" };

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader profile={profile} storeName={data.storeName} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Vant jodi a"
          value={formatCurrencyHTG(data.todaySales)}
          icon={Icons.sales}
          trend={moneyTrend(data.todaySales, data.yesterdaySales, "Pa gen vant jodi a")}
          detail={`${data.todayTransactionCount} vant`}
        />
        <KpiCard
          label="Benefis estime"
          value={formatCurrencyHTG(data.todayProfit)}
          icon={Icons.profit}
          trend={moneyTrend(data.todayProfit, data.yesterdayProfit, "Pa gen benefis jodi a")}
          detail="Estimasyon apati pri achte"
        />
        <KpiCard
          label="Pwodwi ki gen stòk ba"
          value={String(lowStockCount)}
          icon={Icons.alert}
          trend={stockTrend}
          detail="Anba sèy alèt la"
        />
        <KpiCard
          label="Kredi kliyan pou resevwa"
          value={formatCurrencyHTG(data.creditReceivable)}
          icon={Icons.credit}
          trend={creditTrend}
          detail="Total dèt kliyan poko peye"
        />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Aksyon Rapid</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {QUICK_ACTIONS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex min-h-14 items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden />
              </span>
              {label}
              <Icons.next className="ml-auto size-4 text-text-secondary" aria-hidden />
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <SalesTrendChart trend={data.trend} bucket="day" />
        <LowStockPanel products={data.lowStockProducts} />
      </div>

      <RecentSalesPanel sales={data.recentSales} />
    </div>
  );
}
