import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { isOwner } from "@/lib/auth/roles";
import { CategoriesManager } from "@/components/CategoriesManager";

export default async function CategoriesPage() {
  const profile = await getCurrentProfile();

  if (!isOwner(profile)) {
    redirect("/products");
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-foreground">Kategori</h1>
        <p className="text-text-secondary">
          Jere kategori pwodwi boutik ou.
        </p>
      </div>

      <CategoriesManager />
    </div>
  );
}
