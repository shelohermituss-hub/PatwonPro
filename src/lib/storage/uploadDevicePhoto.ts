import { createClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Uploads a tablet model photo to the `device-photos` bucket (migration
 * 030) — unlike `store-logos`/`product-images`/`payment-qr-codes`, this
 * bucket isn't scoped by `{store_id}/...` (a device model exists before
 * any unit is assigned to a store), so the write policy is
 * `admin_can('manage_devices')` directly rather than a folder check.
 */
export async function uploadDevicePhoto(file: File): Promise<{ publicUrl: string | null; error: string | null }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { publicUrl: null, error: "Fòma imaj la pa sipòte (jpeg, png, oswa webp sèlman)." };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { publicUrl: null, error: "Imaj la twò gwo (3 Mo maksimòm)." };
  }

  const supabase = createClient();
  const extension = file.type.split("/")[1];
  const path = `${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from("device-photos").upload(path, file, {
    contentType: file.type,
  });

  if (error) {
    return { publicUrl: null, error: "Nou pa t ka voye foto a. Eseye ankò." };
  }

  const { data } = supabase.storage.from("device-photos").getPublicUrl(path);
  return { publicUrl: data.publicUrl, error: null };
}
