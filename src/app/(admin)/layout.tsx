import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { isPlatformAdmin } from "@/lib/auth/roles";
import { AdminShell } from "@/components/admin/AdminShell";
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

  return <AdminShell actor={actor}>{children}</AdminShell>;
}
