import { getCurrentProfile } from "@/lib/supabase/profile";
import { resolvePeriodRange, type ReportPeriod } from "@/lib/reports/period";
import { fetchReportData } from "@/lib/reports/queries";
import { PeriodTabs } from "@/components/reports/PeriodTabs";
import { CustomRangeForm } from "@/components/reports/CustomRangeForm";
import { KpiCards } from "@/components/reports/KpiCards";
import { SalesTrendChart } from "@/components/reports/SalesTrendChart";
import { PaymentBreakdownChart } from "@/components/reports/PaymentBreakdownChart";
import { TopProductsList } from "@/components/reports/TopProductsList";
import { LowStockPanel } from "@/components/reports/LowStockPanel";

const VALID_PERIODS: ReportPeriod[] = ["today", "week", "month", "custom"];

const PERIOD_SUBTITLES: Record<ReportPeriod, string> = {
  today: "Pèfòmans boutik ou jodi a.",
  week: "Pèfòmans boutik ou semèn sa a.",
  month: "Pèfòmans boutik ou mwa sa a.",
  custom: "Pèfòmans boutik ou sou peryòd ou chwazi a.",
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const period: ReportPeriod = VALID_PERIODS.includes(params.period as ReportPeriod)
    ? (params.period as ReportPeriod)
    : "today";

  const profile = await getCurrentProfile();

  if (!profile?.store_id) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <h1 className="text-2xl font-extrabold text-foreground">Rapò</h1>
        <p className="text-text-secondary">
          Nou pa t ka jwenn boutik ou. Rekonekte epi eseye ankò.
        </p>
      </div>
    );
  }

  const range = resolvePeriodRange(period, params.from, params.to);
  const data = await fetchReportData(profile.store_id, range);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-foreground">Rapò</h1>
        <p className="text-text-secondary">{PERIOD_SUBTITLES[period]}</p>
      </div>

      <div className="flex flex-col gap-3">
        <PeriodTabs active={period} />
        {period === "custom" && (
          <CustomRangeForm from={params.from} to={params.to} />
        )}
      </div>

      <KpiCards summary={data.summary} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <SalesTrendChart trend={data.trend} bucket={range.bucket} />
        <PaymentBreakdownChart data={data.paymentBreakdown} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopProductsList products={data.topProducts} />
        <LowStockPanel products={data.lowStockProducts} />
      </div>
    </div>
  );
}
