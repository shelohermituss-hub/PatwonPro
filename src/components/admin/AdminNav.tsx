"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  UserPlus,
  Hourglass,
  CreditCard,
  ShieldCheck,
  Tablet,
  ClipboardList,
  Headset,
  Receipt,
  RefreshCw,
  BarChart3,
  UserCog,
  ScrollText,
  Settings,
} from "lucide-react";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAdminActor } from "@/components/admin/AdminSessionProvider";
import { visibleNav, type AdminNavId } from "@/lib/admin/permissions";

const NAV_ITEMS: { id: AdminNavId; href: string; label: string; icon: React.ComponentType<{ "aria-hidden"?: boolean }> }[] = [
  { id: "overview", href: "/admin", label: "Vwè Jeneral", icon: LayoutDashboard },
  { id: "stores", href: "/admin/stores", label: "Boutik", icon: Store },
  { id: "leads", href: "/admin/leads", label: "Lead", icon: UserPlus },
  { id: "trials", href: "/admin/trials", label: "Esè", icon: Hourglass },
  { id: "subscriptions", href: "/admin/subscriptions", label: "Abònman", icon: CreditCard },
  { id: "deposits", href: "/admin/deposits", label: "Kosyon", icon: ShieldCheck },
  { id: "devices", href: "/admin/devices", label: "Aparèy", icon: Tablet },
  { id: "installations", href: "/admin/installations", label: "Enstalasyon Teren", icon: ClipboardList },
  { id: "support", href: "/admin/support", label: "Sipò", icon: Headset },
  { id: "transactions", href: "/admin/transactions", label: "Tranzaksyon", icon: Receipt },
  { id: "sync", href: "/admin/sync", label: "Senkwonizasyon", icon: RefreshCw },
  { id: "analytics", href: "/admin/analytics", label: "Analitik", icon: BarChart3 },
  { id: "team", href: "/admin/team", label: "Ekip", icon: UserCog },
  { id: "auditLog", href: "/admin/audit-log", label: "Jounal Odit", icon: ScrollText },
  { id: "settings", href: "/admin/settings", label: "Paramèt Platfòm", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();
  const actor = useAdminActor();
  const visible = new Set(visibleNav(actor.role));

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {NAV_ITEMS.filter((item) => visible.has(item.id)).map(({ href, label, icon: Icon }) => {
              const isActive = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
              return (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton render={<Link href={href} />} isActive={isActive} tooltip={label}>
                    <Icon aria-hidden />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}
