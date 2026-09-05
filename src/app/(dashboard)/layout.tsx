import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import { isPlatformAdmin } from "@/lib/auth/roles";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (isPlatformAdmin(profile)) {
    redirect("/admin");
  }

  let store: { name: string; logo_url: string | null } | null = null;
  if (profile?.store_id) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("stores")
      .select("name, logo_url")
      .eq("id", profile.store_id)
      .maybeSingle();
    store = data;
  }

  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar_state")?.value;

  return (
    <DashboardShell
      profile={profile}
      store={store}
      defaultSidebarOpen={sidebarState !== "false"}
    >
      {children}
    </DashboardShell>
  );
}
