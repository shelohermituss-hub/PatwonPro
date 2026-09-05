"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, type AdminColumn } from "@/components/admin/AdminDataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrencyHTG, formatDateTime } from "@/lib/format";
import type { PlatformTransaction, StoreTransaction } from "@/types/admin";

const PLATFORM_TYPE_LABELS: Record<PlatformTransaction["type"], string> = {
  subscription_payment: "Peman Abònman",
  deposit_received: "Kosyon Resevwa",
  deposit_refunded: "Kosyon Ranbouse",
  installation_fee: "Frè Enstalasyon",
  accessory_sale: "Vant Akseswa",
  discount: "Rabè",
  manual_adjustment: "Ajisteman Manyèl",
};

const STORE_TYPE_LABELS: Record<StoreTransaction["type"], string> = {
  cash_sale: "Vant Kach",
  credit_sale: "Vant Kredi",
  moncash_sale: "Vant MonCash",
  natcash_sale: "Vant NatCash",
  payment_pending: "Peman An Atant",
  payment_confirmed: "Peman Konfime",
  payment_failed: "Peman Echwe",
  cancellation: "Anilasyon",
  refund: "Ranbousman",
  webhook_event: "Evènman Webhook",
};

const PLATFORM_COLUMNS: AdminColumn<PlatformTransaction>[] = [
  { id: "type", header: "Tip", csvValue: (r) => PLATFORM_TYPE_LABELS[r.type], cell: (r) => PLATFORM_TYPE_LABELS[r.type] },
  { id: "store", header: "Boutik", csvValue: (r) => r.storeName ?? "—", cell: (r) => r.storeName ?? "—" },
  { id: "amount", header: "Montan", csvValue: (r) => r.amountHtg, cell: (r) => (
    <span className={r.amountHtg < 0 ? "text-danger" : "text-success"}>{formatCurrencyHTG(r.amountHtg)}</span>
  ) },
  { id: "method", header: "Metòd", csvValue: (r) => r.method, cell: (r) => <span className="uppercase">{r.method}</span> },
  { id: "date", header: "Dat", csvValue: (r) => r.date, cell: (r) => formatDateTime(r.date) },
  { id: "note", header: "Nòt", csvValue: (r) => r.note ?? "", cell: (r) => <span className="text-text-secondary">{r.note ?? "—"}</span> },
];

const STORE_COLUMNS: AdminColumn<StoreTransaction>[] = [
  { id: "store", header: "Boutik", csvValue: (r) => r.storeName, cell: (r) => r.storeName },
  { id: "type", header: "Tip", csvValue: (r) => STORE_TYPE_LABELS[r.type], cell: (r) => STORE_TYPE_LABELS[r.type] },
  { id: "amount", header: "Montan", csvValue: (r) => r.amountHtg, cell: (r) => formatCurrencyHTG(r.amountHtg) },
  { id: "date", header: "Dat", csvValue: (r) => r.date, cell: (r) => formatDateTime(r.date) },
];

export function TransactionsClient({
  platformTransactions,
  storeTransactions,
}: {
  platformTransactions: PlatformTransaction[];
  storeTransactions: StoreTransaction[];
}) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <AdminPageHeader
        title="Tranzaksyon"
        description="Chif vant yon boutik pa janm konte kòm revni Jere Boutik — sèl abònman, frè sèvis, ak komisyon kontraktyèl yo konte."
      />

      <Tabs defaultValue="platform">
        <TabsList variant="line">
          <TabsTrigger value="platform">Finans Jere Boutik</TabsTrigger>
          <TabsTrigger value="stores">Tranzaksyon Boutik</TabsTrigger>
        </TabsList>

        <TabsContent value="platform" className="pt-4">
          <AdminDataTable
            data={platformTransactions}
            columns={PLATFORM_COLUMNS}
            getRowKey={(row) => row.id}
            exportFilename="finans-jere-boutik.csv"
            emptyTitle="Pa gen tranzaksyon"
          />
        </TabsContent>

        <TabsContent value="stores" className="pt-4">
          <AdminDataTable
            data={storeTransactions}
            columns={STORE_COLUMNS}
            searchPlaceholder="Chèche pa non boutik..."
            searchPredicate={(row, q) => row.storeName.toLowerCase().includes(q)}
            getRowKey={(row) => row.id}
            exportFilename="tranzaksyon-boutik.csv"
            emptyTitle="Pa gen tranzaksyon"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
