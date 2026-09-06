import Link from "next/link";
import { Icons } from "@/lib/icons";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { fetchDashboardData } from "@/lib/dashboard/queries";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KpiCard, type KpiTrend } from "@/components/dashboard/KpiCard";
import { RecentSalesPanel } from "@/components/dashboard/RecentSalesPanel";
import { SalesTrendChart } from "@/components/reports/SalesTrendChart";
import { LowStockPanel } from "@/components/reports/LowStockPanel";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
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

// `KpiTrend.icon` is a rendered element, not a bare component — `KpiCard`
// is a Client Component (needs `AnimatedNumber`), and a component
// *reference* can't cross the Server→Client boundary from this page.
const trendUpIcon = <Icons.trendUp className="size-3.5" aria-hidden />;
const trendDownIcon = <Icons.trendDown className="size-3.5" aria-hidden />;

function moneyTrend(current: number, previous: number, noBaselineLabel: string): KpiTrend {
  if (current === 0 && previous === 0) {
    return { tone: "neutral", icon: trendUpIcon, label: noBaselineLabel };
  }
  const pct = pctChange(current, previous);
  if (pct === null) {
    return { tone: "positive", icon: trendUpIcon, label: "Premye a depi ayè" };
  }
  const rounded = Math.round(pct);
  if (rounded === 0) return { tone: "neutral", icon: trendUpIcon, label: "Menm nivo ak ayè" };
  return rounded > 0
    ? { tone: "positive", icon: trendUpIcon, label: `+${rounded}% pase ayè` }
    : { tone: "negative", icon: trendDownIcon, label: `${rounded}% pase ayè` };
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

  const alertIcon = <Icons.alert className="size-3.5" aria-hidden />;
  const successIcon = <Icons.success className="size-3.5" aria-hidden />;
  const customersIcon = <Icons.customers className="size-3.5" aria-hidden />;

  const stockTrend: KpiTrend =
    data.outOfStockCount > 0
      ? { tone: "negative", icon: alertIcon, label: `${data.outOfStockCount} san stòk nèt` }
      : lowStockCount > 0
        ? { tone: "neutral", icon: alertIcon, label: "Bezwen reapwovizyone" }
        : { tone: "positive", icon: successIcon, label: "Tout pwodwi ok" };

  const creditTrend: KpiTrend =
    data.creditCustomersCount > 0
      ? { tone: "neutral", icon: customersIcon, label: `${data.creditCustomersCount} kliyan gen dèt` }
      : { tone: "positive", icon: successIcon, label: "Pa gen dèt kliyan" };

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader profile={profile} storeName={data.storeName} />

      <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StaggerItem>
          <KpiCard
            label="Vant jodi a"
            value={data.todaySales}
            format="currency"
            icon={<Icons.sales className="size-6" aria-hidden />}
            trend={moneyTrend(data.todaySales, data.yesterdaySales, "Pa gen vant jodi a")}
            detail={`${data.todayTransactionCount} vant`}
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            label="Benefis estime"
            value={data.todayProfit}
            format="currency"
            icon={<Icons.profit className="size-6" aria-hidden />}
            trend={moneyTrend(data.todayProfit, data.yesterdayProfit, "Pa gen benefis jodi a")}
            detail="Estimasyon apati pri achte"
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            label="Pwodwi ki gen stòk ba"
            value={lowStockCount}
            icon={<Icons.alert className="size-6" aria-hidden />}
            trend={stockTrend}
            detail="Anba sèy alèt la"
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            label="Kredi kliyan pou resevwa"
            value={data.creditReceivable}
            format="currency"
            icon={<Icons.credit className="size-6" aria-hidden />}
            trend={creditTrend}
            detail="Total dèt kliyan poko peye"
          />
        </StaggerItem>
      </StaggerGroup>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Aksyon Rapid</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {QUICK_ACTIONS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex min-h-14 items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <Icon className="size-5" aria-hidden />
              </span>
              {label}
              <Icons.next className="ml-auto size-4" aria-hidden />
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
