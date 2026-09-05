import { createClient } from "@/lib/supabase/server";
import type { Deposit } from "@/types/admin";

interface DepositRow {
  id: string;
  store_id: string;
  device_id: string | null;
  contract_number: string | null;
  amount_htg: number;
  received_date: string;
  status: string;
  eligible_refund_date: string | null;
  device_condition: string | null;
  amount_to_return_htg: number | null;
  amount_retained_htg: number | null;
  retention_reason: string | null;
  refund_proof_url: string | null;
  store: { name: string } | { name: string }[] | null;
  device: { device_code: string } | { device_code: string }[] | null;
  agent: { full_name: string } | { full_name: string }[] | null;
}

export async function fetchDeposits(): Promise<Deposit[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("deposits")
    .select(
      "*, store:stores(name), device:devices(device_code), agent:profiles!deposits_finance_agent_id_fkey(full_name)",
    )
    .order("received_date", { ascending: false });

  if (error) {
    throw new Error(`Pa t kapab chaje kosyon yo: ${error.message}`);
  }

  return ((data ?? []) as DepositRow[]).map((row) => {
    const store = Array.isArray(row.store) ? row.store[0] : row.store;
    const device = Array.isArray(row.device) ? row.device[0] : row.device;
    const agent = Array.isArray(row.agent) ? row.agent[0] : row.agent;
    return {
      id: row.id,
      storeId: row.store_id,
      storeName: store?.name ?? "—",
      contractNumber: row.contract_number ?? "—",
      deviceId: device?.device_code ?? "—",
      amountHtg: row.amount_htg,
      receivedDate: row.received_date,
      status: row.status as Deposit["status"],
      eligibleRefundDate: row.eligible_refund_date,
      deviceCondition: row.device_condition,
      amountToReturnHtg: row.amount_to_return_htg,
      amountRetainedHtg: row.amount_retained_htg,
      retentionReason: row.retention_reason,
      refundProofUrl: row.refund_proof_url,
      financeAgent: agent?.full_name ?? "Pa asiyen",
    };
  });
}
