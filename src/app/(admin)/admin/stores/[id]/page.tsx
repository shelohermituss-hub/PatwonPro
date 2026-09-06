import { notFound } from "next/navigation";
import { fetchStoreDetail } from "@/lib/admin/queries/storeDetail";
import { StoreDetailClient } from "./StoreDetailClient";
import { requireNavAccess } from "@/lib/admin/guardNav";

export default async function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireNavAccess("stores");
  const { id } = await params;
  const detail = await fetchStoreDetail(id);

  if (!detail) notFound();

  return <StoreDetailClient detail={detail} />;
}
