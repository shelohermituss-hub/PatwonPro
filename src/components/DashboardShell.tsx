import { AppSidebar } from "@/components/AppSidebar";
import { InstallPrompt } from "@/components/InstallPrompt";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import type { Profile } from "@/types";

export function DashboardShell({
  profile,
  store,
  defaultSidebarOpen,
  children,
}: {
  profile: Profile | null;
  store?: { name: string; logo_url: string | null } | null;
  defaultSidebarOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      defaultOpen={defaultSidebarOpen}
      style={{ "--sidebar-width": "248px" } as React.CSSProperties}
      className="h-dvh overflow-hidden"
    >
      <AppSidebar profile={profile} store={store} />
      <SidebarInset className="min-h-0">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4!" />
        </header>
        <InstallPrompt />
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
