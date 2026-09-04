import { DashboardShell } from "@/components/DashboardShell";
import { getCurrentProfile } from "@/lib/supabase/profile";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}
