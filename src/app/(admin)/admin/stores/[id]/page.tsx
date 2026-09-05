import { notFound } from "next/navigation";
import { fetchStoreDetail } from "@/lib/admin/queries/storeDetail";
import { StoreDetailClient } from "./StoreDetailClient";

export default async function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await fetchStoreDetail(id);

  if (!detail) notFound();

  return <StoreDetailClient detail={detail} />;
}
