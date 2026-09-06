import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { isPlatformAdmin } from "@/lib/auth/roles";
import { AdminShell } from "@/components/admin/AdminShell";
import { fetchAdminAlertCount } from "@/lib/admin/queries/alerts";
import type { AdminActor } from "@/types/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile || !isPlatformAdmin(profile)) {
    redirect("/dashboard");
  }

  const actor: AdminActor = {
    id: profile.id,
    name: profile.full_name,
    role: profile.admin_role ?? "read_only",
  };

  const alertCount = await fetchAdminAlertCount();

  return (
    <AdminShell actor={actor} alertCount={alertCount}>
      {children}
    </AdminShell>
  );
}
