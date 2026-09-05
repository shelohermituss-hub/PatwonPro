import { fetchPlatformTransactions, fetchStoreTransactions } from "@/lib/admin/queries/transactions";
import { TransactionsClient } from "./TransactionsClient";

export default async function TransactionsPage() {
  const [platformTransactions, storeTransactions] = await Promise.all([
    fetchPlatformTransactions(),
    fetchStoreTransactions(),
  ]);

  return (
    <TransactionsClient platformTransactions={platformTransactions} storeTransactions={storeTransactions} />
  );
}
