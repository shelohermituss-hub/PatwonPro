import { fetchPlatformTransactions, fetchStoreTransactions } from "@/lib/admin/queries/transactions";
import { TransactionsClient } from "./TransactionsClient";
import { requireNavAccess } from "@/lib/admin/guardNav";

export default async function TransactionsPage() {
  await requireNavAccess("transactions");
  const [platformTransactions, storeTransactions] = await Promise.all([
    fetchPlatformTransactions(),
    fetchStoreTransactions(),
  ]);

  return (
    <TransactionsClient platformTransactions={platformTransactions} storeTransactions={storeTransactions} />
  );
}
