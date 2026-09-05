import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { KpiStat } from "@/components/admin/KpiStat";
import { StoreGrowthChart } from "@/components/admin/StoreGrowthChart";
import { MrrChart } from "@/components/admin/MrrChart";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyHTG } from "@/lib/format";
import { fetchAdminStores } from "@/lib/admin/queries/stores";
import { fetchAdminSubscriptions } from "@/lib/admin/queries/subscriptions";
import { fetchAdminDevices } from "@/lib/admin/queries/devices";
import { fetchAdminSupportTickets } from "@/lib/admin/queries/support";
import { fetchPlatformTransactions } from "@/lib/admin/queries/transactions";
import { fetchLeads } from "@/lib/admin/queries/leads";
import { MOCK_SYNC_HEALTH } from "@/lib/admin/mock/sync";
import { SUPPORT_PRIORITY_LABELS } from "@/lib/admin/labels";
import type { SyncHealthRow } from "@/types/admin";

function countOfflineDevices(rows: SyncHealthRow[]): number {
  const now = Date.now();
  return rows.filter((row) => (now - new Date(row.lastSyncAt).getTime()) / 86_400_000 > 3).length;
}

export default async function AdminOverviewPage() {
  const [stores, subscriptions, devices, tickets, platformTransactions, leads] = await Promise.all([
    fetchAdminStores(),
    fetchAdminSubscriptions(),
    fetchAdminDevices(),
    fetchAdminSupportTickets(),
    fetchPlatformTransactions(),
    fetchLeads(),
  ]);

  const activeStores = stores.filter((s) => s.subscriptionStatus === "active").length;
  const trialStores = stores.filter((s) => s.subscriptionStatus === "trial").length;
  const mrr = subscriptions
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + s.monthlyPriceHtg, 0);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const collectedThisMonth = platformTransactions
    .filter((t) => t.type === "subscription_payment" && new Date(t.date) >= startOfMonth)
    .reduce((sum, t) => sum + t.amountHtg, 0);

  const overdueTotal = subscriptions
    .filter((s) => s.status === "past_due" || s.status === "suspended")
    .reduce((sum, s) => sum + s.amountDueHtg, 0);
  const deployedDevices = devices.filter((d) => d.status.startsWith("deployed_")).length;
  const availableDevices = devices.filter((d) => d.status === "in_stock").length;
  const openTickets = tickets.filter((t) => t.status !== "resolved" && t.status !== "closed").length;
  const syncErrors = MOCK_SYNC_HEALTH.filter((row) => row.errors > 0).length;

  const trialsEndingSoon = leads.filter((l) => l.stage === "trial_active" || l.stage === "trial_installed").length;
  const overdueSubs = subscriptions.filter((s) => s.status === "past_due" || s.status === "suspended").length;
  const offlineDeviceCount = countOfflineDevices(MOCK_SYNC_HEALTH);
  const repairDevices = devices.filter((d) => d.status === "repair").length;
  const newTickets = tickets.filter((t) => t.status === "open").length;
  const p1Tickets = tickets.filter((t) => t.priority === "P1" && t.status !== "resolved" && t.status !== "closed").length;

  return (
    <div className="flex flex-col gap-6 p-6">
      <AdminPageHeader
        title="Bonjou"
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
        <KpiStat label="Total An Reta" value={formatCurrencyHTG(overdueTotal)} href="/admin/subscriptions?status=past_due" tone="warning" />
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
              • {newTickets} tikè nouvo pou triye
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alèt Enpòtan</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <p className="flex items-center gap-2 text-foreground">
              • {offlineDeviceCount} tablèt offline pi plis pase 3 jou
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
