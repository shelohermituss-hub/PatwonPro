import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StoreGrowthChart } from "@/components/admin/StoreGrowthChart";
import { MrrChart } from "@/components/admin/MrrChart";
import { Card, CardContent } from "@/components/ui/card";
import { ANALYTICS_REPORTS } from "@/lib/admin/mock/analytics";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <AdminPageHeader title="Analitik" description="Vizyon global sou kwasans, revni, ak pèfòmans ekip la." />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <StoreGrowthChart />
        <MrrChart />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ANALYTICS_REPORTS.map((report) => (
          <Card key={report.label}>
            <CardContent className="flex flex-col gap-1">
              <span className="text-xs font-medium text-text-secondary">{report.label}</span>
              <span className="text-xl font-bold text-foreground">{report.value}</span>
              <span className="text-xs text-text-secondary">{report.detail}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
