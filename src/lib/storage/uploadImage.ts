import { createClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export interface UploadImageResult {
  publicUrl: string | null;
  error: string | null;
}

/**
 * Uploads an image to a public Supabase Storage bucket under
 * `{storeId}/...` — the path prefix both `store-logos` and
 * `product-images` RLS policies key off (00000000000010_storage_logos_and_product_images.sql).
 * `upsert: true` + a fixed file name per entity means re-uploading a logo/
 * photo replaces the old object instead of accumulating orphans.
 */
export async function uploadImage({
  bucket,
  storeId,
  fileName,
  file,
}: {
  bucket: "store-logos" | "product-images";
  storeId: string;
  fileName: string;
  file: File;
}): Promise<UploadImageResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { publicUrl: null, error: "Fòma imaj la pa sipòte (jpeg, png, oswa webp sèlman)." };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { publicUrl: null, error: "Imaj la twò gwo (3 Mo maksimòm)." };
  }

  const supabase = createClient();
  const extension = file.type.split("/")[1];
  const path = `${storeId}/${fileName}.${extension}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });

  if (error) {
    return { publicUrl: null, error: "Nou pa t ka voye imaj la. Eseye ankò." };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { publicUrl: `${data.publicUrl}?t=${Date.now()}`, error: null };
}
