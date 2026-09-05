import { createClient } from "@/lib/supabase/server";
import { fetchAdminStores } from "@/lib/admin/queries/stores";
import { fetchAdminSubscriptions } from "@/lib/admin/queries/subscriptions";
import { fetchLeads } from "@/lib/admin/queries/leads";
import { fetchAdminDevices } from "@/lib/admin/queries/devices";
import { fetchAdminSupportTickets } from "@/lib/admin/queries/support";
import { fetchPlatformTransactions } from "@/lib/admin/queries/transactions";
import { formatCurrencyHTG } from "@/lib/format";

export interface StoreGrowthPoint {
  month: string;
  stores: number;
}

export interface CollectedPoint {
  month: string;
  collected: number;
}

export interface AnalyticsReport {
  label: string;
  value: string;
  detail: string;
}

const NOT_ENOUGH_DATA = "Poko gen ase done";

const MONTH_LABELS = ["Jan", "Fev", "Mas", "Avr", "Me", "Jen", "Jiy", "Out", "Sept", "Okt", "Nov", "Des"];

function lastNMonths(n: number): { year: number; month: number; label: string }[] {
  const now = new Date();
  const points: { year: number; month: number; label: string }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    points.push({ year: d.getFullYear(), month: d.getMonth(), label: MONTH_LABELS[d.getMonth()] });
  }
  return points;
}

/** Cumulative real store count at the end of each of the last 6 months — from `stores.created_at`, no fabricated trend. */
export async function fetchStoreGrowthSeries(): Promise<StoreGrowthPoint[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("stores").select("created_at");
  if (error) throw new Error(`Pa t kapab chaje kwasans boutik: ${error.message}`);

  const createdDates = (data ?? []).map((s) => new Date(s.created_at));
  return lastNMonths(6).map(({ year, month, label }) => {
    const cutoff = new Date(year, month + 1, 1);
    const count = createdDates.filter((d) => d < cutoff).length;
    return { month: label, stores: count };
  });
}

/** Real platform revenue collected per month, from `platform_transactions` — replaces the mock's fabricated "MRR" trend, which no snapshot exists to reconstruct. */
export async function fetchCollectedSeries(): Promise<CollectedPoint[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("platform_transactions")
    .select("amount_htg, occurred_at")
    .eq("type", "subscription_payment");
  if (error) throw new Error(`Pa t kapab chaje lajan antre: ${error.message}`);

  const rows = data ?? [];
  return lastNMonths(6).map(({ year, month, label }) => {
    const collected = rows
      .filter((r) => {
        const d = new Date(r.occurred_at);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((sum, r) => sum + r.amount_htg, 0);
    return { month: label, collected };
  });
}

export async function fetchAnalyticsReports(): Promise<AnalyticsReport[]> {
  const supabase = await createClient();
  const [stores, subscriptions, leads, devices, tickets, platformTransactions] = await Promise.all([
    fetchAdminStores(),
    fetchAdminSubscriptions(),
    fetchLeads(),
    fetchAdminDevices(),
    fetchAdminSupportTickets(),
    fetchPlatformTransactions(),
  ]);

  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const { count: salesLast7Days } = await supabase
    .from("sales")
    .select("id", { count: "exact", head: true })
    .gte("created_at", sevenDaysAgo);

  const activeStores = stores.filter((s) => s.subscriptionStatus === "active").length;

  const trialsFinished = leads.filter((l) =>
    ["converted", "lost", "device_recovered"].includes(l.stage),
  );
  const converted = leads.filter((l) => l.stage === "converted").length;
  const conversionRate = trialsFinished.length > 0 ? Math.round((converted / trialsFinished.length) * 100) : null;

  const mrrTheoretical = subscriptions
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + s.monthlyPriceHtg, 0);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const collectedThisMonth = platformTransactions
    .filter((t) => t.type === "subscription_payment" && new Date(t.date) >= startOfMonth)
    .reduce((sum, t) => sum + t.amountHtg, 0);

  const unpaidTotal = subscriptions.reduce((sum, s) => sum + s.amountDueHtg, 0);

  const churned = subscriptions.filter((s) => s.status === "canceled" || s.status === "expired").length;
  const churnRate = subscriptions.length > 0 ? ((churned / subscriptions.length) * 100).toFixed(1) : null;

  const zoneCounts = new Map<string, number>();
  for (const s of stores) {
    const zone = s.zone === "—" ? "Pa klase" : s.zone;
    zoneCounts.set(zone, (zoneCounts.get(zone) ?? 0) + 1);
  }
  const topZones = Array.from(zoneCounts.entries()).sort((a, b) => b[1] - a[1]);
  const zoneSummary = topZones.length
    ? topZones
        .slice(0, 2)
        .map(([zone, count]) => `${zone} ${Math.round((count / stores.length) * 100)}%`)
        .join(" · ")
    : NOT_ENOUGH_DATA;

  const inactiveStores = stores.filter((s) => {
    if (!s.lastSaleAt) return true;
    const days = (Date.now() - new Date(s.lastSaleAt).getTime()) / 86_400_000;
    return days > 14;
  }).length;

  const inRepair = devices.filter((d) => d.status === "repair").length;
  const refurbished = devices.filter((d) => d.status === "refurbished").length;

  const agentConversions = new Map<string, number>();
  for (const l of leads.filter((l) => l.stage === "converted")) {
    agentConversions.set(l.agentName, (agentConversions.get(l.agentName) ?? 0) + 1);
  }
  const topAgents = Array.from(agentConversions.entries()).sort((a, b) => b[1] - a[1]);

  const resolvedTickets = tickets.filter((t) => t.status === "resolved" || t.status === "closed");
  const resolvedWithinSla = resolvedTickets.filter((t) => new Date(t.updatedAt) <= new Date(t.slaDeadline));
  const slaRate = resolvedTickets.length > 0 ? Math.round((resolvedWithinSla.length / resolvedTickets.length) * 100) : null;
  const openTickets = tickets.filter((t) => t.status !== "resolved" && t.status !== "closed").length;

  return [
    { label: "Boutik aktif pa mwa", value: String(activeStores), detail: `Sou ${stores.length} boutik total` },
    {
      label: "Konvèsyon esè → kontra",
      value: conversionRate !== null ? `${conversionRate}%` : NOT_ENOUGH_DATA,
      detail: trialsFinished.length > 0 ? `${converted} sou ${trialsFinished.length} esè fini` : "Okenn esè fini ankò",
    },
    { label: "MRR teyorik", value: formatCurrencyHTG(mrrTheoretical), detail: `${activeStores} boutik aktif` },
    { label: "Lajan antre mwa a", value: formatCurrencyHTG(collectedThisMonth), detail: "Sou tranzaksyon platfòm reyèl" },
    { label: "Enpeye total", value: formatCurrencyHTG(unpaidTotal), detail: `Sou ${subscriptions.length} abònman` },
    {
      label: "Churn total",
      value: churnRate !== null ? `${churnRate}%` : NOT_ENOUGH_DATA,
      detail: `${churned} kontra klotire/ekspire`,
    },
    { label: "Retansyon pa kohòt", value: NOT_ENOUGH_DATA, detail: "Bezwen plizyè mwa istorik pou kalkile sa" },
    { label: "Boutik pa zòn", value: zoneSummary === NOT_ENOUGH_DATA ? NOT_ENOUGH_DATA : zoneSummary, detail: `Sou ${stores.length} boutik` },
    { label: "Boutik inaktif", value: String(inactiveStores), detail: "Pa gen vant depi 14+ jou (oswa jamè)" },
    {
      label: "Vant mwayèn pa boutik",
      value: activeStores > 0 ? `${(((salesLast7Days ?? 0) / 7) / activeStores).toFixed(1)}/jou` : NOT_ENOUGH_DATA,
      detail: `Sou 7 dènye jou, ${activeStores} boutik aktif`,
    },
    { label: "Aparèy an reparasyon", value: String(inRepair), detail: `${refurbished} rekondisyone` },
    {
      label: "Pèfòmans komèsyal",
      value: topAgents.length > 0 ? `${topAgents[0][0]} — ${topAgents[0][1]} konvèsyon` : NOT_ENOUGH_DATA,
      detail: topAgents.length > 1 ? `${topAgents[1][0]} — ${topAgents[1][1]} konvèsyon` : "Pa gen ase konvèsyon ankò",
    },
    {
      label: "Pèfòmans sipò",
      value: slaRate !== null ? `${slaRate}% rezoud nan SLA` : NOT_ENOUGH_DATA,
      detail: `${openTickets} tikè ouvè kounye a`,
    },
    { label: "Kou akizisyon kliyan", value: NOT_ENOUGH_DATA, detail: "Bezwen done depans maketing, ki pa egziste ankò" },
  ];
}
