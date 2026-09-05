import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { isPlatformAdmin } from "@/lib/auth/roles";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!isPlatformAdmin(profile)) {
    redirect("/dashboard");
  }

  return <AdminShell>{children}</AdminShell>;
}
