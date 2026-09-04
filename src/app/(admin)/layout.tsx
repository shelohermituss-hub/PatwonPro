import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { isPlatformAdmin } from "@/lib/auth/roles";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!isPlatformAdmin(profile)) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
