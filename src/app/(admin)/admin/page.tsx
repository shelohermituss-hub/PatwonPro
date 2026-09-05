import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { KpiStat } from "@/components/admin/KpiStat";
import { StoreGrowthChart } from "@/components/admin/StoreGrowthChart";
import { MrrChart } from "@/components/admin/MrrChart";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyHTG } from "@/lib/format";
import { MOCK_STORES } from "@/lib/admin/mock/stores";
import { MOCK_SUBSCRIPTIONS } from "@/lib/admin/mock/subscriptions";
import { MOCK_DEVICES } from "@/lib/admin/mock/devices";
import { MOCK_SUPPORT_TICKETS } from "@/lib/admin/mock/support";
import { MOCK_SYNC_HEALTH } from "@/lib/admin/mock/sync";
import { MOCK_PLATFORM_TRANSACTIONS } from "@/lib/admin/mock/transactions";
import { MOCK_LEADS } from "@/lib/admin/mock/leads";
import { SUPPORT_PRIORITY_LABELS } from "@/lib/admin/labels";
import { ADMIN_MOCK_NOW } from "@/lib/admin/now";

export default function AdminOverviewPage() {
  const activeStores = MOCK_STORES.filter((s) => s.subscriptionStatus === "active").length;
  const trialStores = MOCK_STORES.filter((s) => s.subscriptionStatus === "trial").length;
  const mrr = MOCK_SUBSCRIPTIONS.filter((s) => s.status === "active").reduce(
    (sum, s) => sum + s.monthlyPriceHtg,
    0,
  );
  const collectedThisMonth = MOCK_PLATFORM_TRANSACTIONS.filter(
    (t) => t.type === "subscription_payment" && t.date.startsWith("2026-08"),
  ).reduce((sum, t) => sum + t.amountHtg, 0);
  const overdueTotal = MOCK_SUBSCRIPTIONS.filter((s) =>
    ["overdue", "suspended", "grace_period"].includes(s.status),
  ).reduce((sum, s) => sum + s.amountDueHtg, 0);
  const deployedDevices = MOCK_DEVICES.filter((d) => d.status.startsWith("deployed_")).length;
  const availableDevices = MOCK_DEVICES.filter((d) => d.status === "in_stock").length;
  const openTickets = MOCK_SUPPORT_TICKETS.filter((t) => t.status !== "resolved").length;
  const syncErrors = MOCK_SYNC_HEALTH.filter((row) => row.errors > 0).length;

  const trialsEndingSoon = MOCK_LEADS.filter((l) => l.stage === "trial_active" || l.stage === "trial_installed").length;
  const overdueSubs = MOCK_SUBSCRIPTIONS.filter((s) => s.status === "overdue" || s.status === "grace_period").length;
  const offlineDevices = MOCK_SYNC_HEALTH.filter((row) => {
    const days = (ADMIN_MOCK_NOW - new Date(row.lastSyncAt).getTime()) / 86_400_000;
    return days > 3;
  });
  const repairDevices = MOCK_DEVICES.filter((d) => d.status === "repair").length;
  const p1Tickets = MOCK_SUPPORT_TICKETS.filter((t) => t.priority === "P1" && t.status !== "resolved").length;

  return (
    <div className="flex flex-col gap-6 p-6">
      <AdminPageHeader
        title="Bonjou, Shelo"
        description="Men sante Jere Boutik jodi a."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiStat label="Boutik Aktif" value={String(activeStores)} href="/admin/stores?status=active" tone="positive" />
        <KpiStat label="An Esè" value={String(trialStores)} href="/admin/trials" tone="info" />
        <KpiStat label="MRR Atann" value={formatCurrencyHTG(mrr)} href="/admin/subscriptions" tone="positive" />
        <KpiStat
          label="Ankesman Mwa a"
          value={formatCurrencyHTG(collectedThisMonth)}
          href="/admin/transactions"
          tone="positive"
        />
        <KpiStat label="Total An Reta" value={formatCurrencyHTG(overdueTotal)} href="/admin/subscriptions?status=overdue" tone="warning" />
        <KpiStat label="Tablèt Deplwaye" value={String(deployedDevices)} href="/admin/devices?status=deployed" tone="info" />
        <KpiStat label="Tablèt Disponib" value={String(availableDevices)} href="/admin/devices?status=in_stock" tone="neutral" />
        <KpiStat label="Tikè Ouvè" value={String(openTickets)} href="/admin/support" tone="warning" />
        <KpiStat label="Sync An Erè" value={String(syncErrors)} href="/admin/sync" tone="negative" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <StoreGrowthChart />
        <MrrChart />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pou Trete Jodi a</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <p className="text-foreground">
              • {trialsEndingSoon} esè k ap fini nan 7 jou
            </p>
            <p className="text-foreground">• {overdueSubs} kliyan bezwen relans</p>
            <p className="text-foreground">
              • {MOCK_SUPPORT_TICKETS.filter((t) => t.status === "new").length} tikè nouvo pou triye
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alèt Enpòtan</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <p className="flex items-center gap-2 text-foreground">
              • {offlineDevices.length} tablèt offline pi plis pase 3 jou
            </p>
            <p className="flex items-center gap-2 text-foreground">
              • {repairDevices} tablèt an reparasyon
            </p>
            {p1Tickets > 0 && (
              <p className="flex items-center gap-2 text-foreground">
                • {p1Tickets} tikè{" "}
                <StatusBadge {...SUPPORT_PRIORITY_LABELS.P1} /> ki bezwen atansyon menm jou a
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
