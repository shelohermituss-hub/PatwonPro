import { createClient } from "@/lib/supabase/client";
import type { DepositFormOutput } from "@/lib/validations/deposit";
import type { DepositStatus } from "@/types/admin";

export async function createDeposit(input: DepositFormOutput) {
  const supabase = createClient();
  const { error } = await supabase.from("deposits").insert({
    store_id: input.storeId,
    device_id: input.deviceId || null,
    contract_number: input.contractNumber || null,
    amount_htg: input.amountHtg,
    received_date: input.receivedDate,
  });
  if (error) throw new Error(error.message);
}

export async function updateDepositStatus(
  depositId: string,
  status: DepositStatus,
  extra?: { amountToReturnHtg?: number | null; amountRetainedHtg?: number | null; retentionReason?: string | null },
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("deposits")
    .update({
      status,
      ...(extra?.amountToReturnHtg !== undefined ? { amount_to_return_htg: extra.amountToReturnHtg } : {}),
      ...(extra?.amountRetainedHtg !== undefined ? { amount_retained_htg: extra.amountRetainedHtg } : {}),
      ...(extra?.retentionReason !== undefined ? { retention_reason: extra.retentionReason } : {}),
    })
    .eq("id", depositId);
  if (error) throw new Error(error.message);
}
