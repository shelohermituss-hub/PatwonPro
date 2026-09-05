"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, LoaderCircle } from "lucide-react";
import { Icons } from "@/lib/icons";
import { SyncStatusBadge } from "@/components/SyncStatusBadge";
import { Logo } from "@/components/Logo";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

const navItems = [
  { href: "/dashboard", label: "Tablo Bò", icon: Icons.dashboard },
  { href: "/sales/new", matchPrefix: "/sales", label: "Pwen Vant", icon: Icons.pos },
  { href: "/products", label: "Pwodwi", icon: Icons.product },
  { href: "/stock-entries", label: "Antre Stòk", icon: Icons.stock },
  { href: "/credits", label: "Kredi", icon: Icons.credit },
  { href: "/reports", label: "Rapò", icon: Icons.reports },
  { href: "/subscription", label: "Abònman", icon: Icons.subscription },
  { href: "/settings", label: "Paramèt", icon: Icons.settings },
];

const ROLE_LABELS: Record<Profile["role"], string> = {
  owner: "Pwopriyetè",
  employee: "Anplwaye",
  platform_admin: "Admin platfòm",
};

/**
 * Swaps the nav icon for a spinner the instant a click is registered —
 * `useLinkStatus()` flips to `pending: true` synchronously on click,
 * well before the new route's server round trip resolves, so this is
 * the difference between a sidebar link feeling instantly responsive
 * and feeling like it did nothing until the page eventually changes.
 */
function NavIcon({ icon: Icon }: { icon: React.ComponentType<{ "aria-hidden"?: boolean }> }) {
  const { pending } = useLinkStatus();
  return pending ? (
    <LoaderCircle className="animate-spin" aria-hidden />
  ) : (
    <Icon aria-hidden />
  );
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export function AppSidebar({
  profile,
  store,
}: {
  profile: Profile | null;
  store?: { name: string; logo_url: string | null } | null;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <Logo size={24} className="shrink-0 rounded-md" />
          <span className="truncate text-base font-semibold text-foreground group-data-[collapsible=icon]:hidden">
            PatwonPro
          </span>
        </div>

        {store && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" tooltip={store.name} className="cursor-default">
                <Avatar size="sm" className="rounded-md">
                  <AvatarImage src={store.logo_url ?? undefined} alt={store.name} />
                  <AvatarFallback className="rounded-md">
                    {initials(store.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-sm font-medium">{store.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ href, matchPrefix, label, icon: Icon }) => {
                const prefix = matchPrefix ?? href;
                const isActive = pathname === prefix || pathname.startsWith(`${prefix}/`);
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      render={<Link href={href} />}
                      isActive={isActive}
                      tooltip={label}
                      className="data-active:bg-primary data-active:text-primary-foreground data-active:hover:bg-primary/90 data-active:hover:text-primary-foreground"
                    >
                      <NavIcon icon={Icon} />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {profile && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" tooltip={profile.full_name} className="cursor-default">
                <Avatar size="sm">
                  <AvatarFallback>{initials(profile.full_name)}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">{profile.full_name}</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">
                    {ROLE_LABELS[profile.role]}
                  </span>
                </div>
              </SidebarMenuButton>
              <SidebarMenuAction onClick={handleSignOut} title="Dekonekte">
                <LogOut aria-hidden />
                <span className="sr-only">Dekonekte</span>
              </SidebarMenuAction>
            </SidebarMenuItem>
          </SidebarMenu>
        )}

        <SidebarSeparator className="mx-0" />

        <div className="px-2 py-1 group-data-[collapsible=icon]:hidden">
          <SyncStatusBadge />
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
