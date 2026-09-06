import { createClient } from "@/lib/supabase/client";

export interface ResolveReplacementRequestInput {
  status: "approved" | "rejected";
  resolutionNote: string | null;
  resolvedBy: string;
}

/**
 * Approving here only records the decision — assigning the actual
 * replacement tablet still goes through the normal `AssignDeviceDialog`
 * flow on this same page, same as any other device assignment (see the
 * plan's decision to keep this a deliberate two-step gesture rather than
 * an automatic device swap).
 */
export async function resolveReplacementRequest(
  requestId: string,
  input: ResolveReplacementRequestInput,
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("replacement_requests")
    .update({
      status: input.status,
      resolution_note: input.resolutionNote,
      resolved_by: input.resolvedBy,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", requestId);
  if (error) throw new Error(error.message);
}
