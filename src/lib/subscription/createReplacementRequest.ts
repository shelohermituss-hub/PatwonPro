import { createClient } from "@/lib/supabase/client";

export interface CreateReplacementRequestInput {
  storeId: string;
  deviceId: string;
  reason: string;
}

/**
 * Online-only insert, same reasoning as `createSupportTicket` — a
 * replacement request is low-volume and platform-team-facing, no
 * offline need.
 */
export async function createReplacementRequest(input: CreateReplacementRequestInput) {
  const supabase = createClient();
  const { error } = await supabase.from("replacement_requests").insert({
    store_id: input.storeId,
    device_id: input.deviceId,
    reason: input.reason,
  });
  return { error };
}
