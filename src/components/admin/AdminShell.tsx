"use client";

import { useRouter } from "next/navigation";
import { Bell, LogOut, Search } from "lucide-react";
import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminSessionProvider, useAdminActor } from "@/components/admin/AdminSessionProvider";
import { ADMIN_ROLE_LABELS } from "@/lib/admin/permissions";
import { createClient } from "@/lib/supabase/client";
import type { AdminActor } from "@/types/admin";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function AdminHeader() {
  const router = useRouter();
  const actor = useAdminActor();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-4!" />

      <div className="relative max-w-sm flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" aria-hidden />
        <Input placeholder="Chèche yon boutik, tikè, aparèy..." className="pl-9" />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button type="button" variant="ghost" size="icon" aria-label="Notifikasyon" className="relative">
          <Bell aria-hidden />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-danger" aria-hidden />
        </Button>

        <div className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5">
          <Avatar size="sm">
            <AvatarFallback>{initials(actor.name)}</AvatarFallback>
          </Avatar>
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-xs font-medium text-foreground">{actor.name}</span>
            <span className="text-[11px] text-text-secondary">{ADMIN_ROLE_LABELS[actor.role]}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Dekonekte"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </header>
  );
}

/**
 * Root shell for the whole `/admin` back-office — deliberately different
 * from the merchant `DashboardShell` (dark navy sidebar via the
 * `.admin-theme` class in globals.css, which only redefines the
 * `--sidebar*` tokens; everything else stays the app's normal light
 * tokens) so the internal team immediately knows they're in a different
 * tool, per the spec.
 */
export function AdminShell({
  actor,
  children,
}: {
  actor: AdminActor;
  children: React.ReactNode;
}) {
  return (
    <AdminSessionProvider actor={actor}>
      <div className="admin-theme">
        <SidebarProvider style={{ "--sidebar-width": "248px" } as React.CSSProperties} className="h-dvh overflow-hidden">
          <Sidebar collapsible="icon">
            <SidebarHeader>
              <div className="flex flex-col gap-0.5 px-2 py-1.5 group-data-[collapsible=icon]:items-center">
                <span className="text-sm font-extrabold tracking-tight text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                  JERE BOUTIK
                </span>
                <span className="text-[10px] font-semibold tracking-widest text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
                  ADMIN PLATFORM
                </span>
              </div>
            </SidebarHeader>
            <AdminNav />
            <SidebarFooter>
              <p className="px-2 py-1 text-[11px] text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden">
                Sistèm entèn — pa pou kliyan
              </p>
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>

          <SidebarInset className="min-h-0">
            <AdminHeader />
            <div className="min-h-0 flex-1 overflow-y-auto bg-background">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </AdminSessionProvider>
  );
}
