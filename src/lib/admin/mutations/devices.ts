import { createClient } from "@/lib/supabase/client";

async function setStatus(deviceDbId: string, status: string) {
  const supabase = createClient();
  const { error } = await supabase.from("devices").update({ status }).eq("id", deviceDbId);
  if (error) throw new Error(error.message);
}

export const markDeviceReady = (deviceDbId: string) => setStatus(deviceDbId, "in_stock");
export const reserveDevice = (deviceDbId: string) => setStatus(deviceDbId, "reserved");
export const reportDeviceLost = (deviceDbId: string) => setStatus(deviceDbId, "lost");
export const logDeviceRepair = (deviceDbId: string) => setStatus(deviceDbId, "repair");
