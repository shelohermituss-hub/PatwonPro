"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Icons } from "@/lib/icons";
import { SyncStatusBadge } from "@/components/SyncStatusBadge";
import { InstallPrompt } from "@/components/InstallPrompt";
import { Logo } from "@/components/Logo";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
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

function storeInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export function DashboardShell({
  profile,
  store,
  children,
}: {
  profile: Profile | null;
  store?: { name: string; logo_url: string | null } | null;
  children: React.ReactNode;
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
    <div className="flex h-dvh overflow-hidden">
      <aside className="flex w-sidebar shrink-0 flex-col border-r border-border bg-surface">
        <div className="flex items-center gap-2 px-4 py-5">
          <Logo size={28} className="shrink-0 rounded-md" />
          <span className="text-lg font-semibold text-foreground">PatwonPro</span>
        </div>

        {store && (
          <div className="flex items-center gap-2 border-t border-border px-4 py-3">
            <Avatar size="sm">
              <AvatarImage src={store.logo_url ?? undefined} alt={store.name} />
              <AvatarFallback>{storeInitials(store.name)}</AvatarFallback>
            </Avatar>
            <span className="truncate text-sm font-medium text-foreground">{store.name}</span>
          </div>
        )}

        <nav className="flex flex-1 flex-col gap-1 px-2">
          {navItems.map(({ href, matchPrefix, label, icon: Icon }) => {
            const prefix = matchPrefix ?? href;
            const isActive = pathname === prefix || pathname.startsWith(`${prefix}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-12 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-text-secondary hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-5 shrink-0" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>

        {profile && (
          <div className="flex items-center gap-2 border-t border-border px-3 py-3">
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium text-foreground">
                {profile.full_name}
              </span>
              <span className="text-xs text-text-secondary">
                {ROLE_LABELS[profile.role]}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              aria-label="Dekonekte"
              className="size-9 shrink-0 text-text-secondary hover:text-danger"
            >
              <LogOut className="size-5" aria-hidden />
            </Button>
          </div>
        )}

        <div className="border-t border-border p-3">
          <SyncStatusBadge />
        </div>
      </aside>
      <div className="flex min-h-0 flex-1 flex-col">
        <InstallPrompt />
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
