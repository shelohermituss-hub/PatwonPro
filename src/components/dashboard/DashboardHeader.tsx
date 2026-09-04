"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { SyncStatusBadge } from "@/components/SyncStatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

const ROLE_LABELS: Record<Profile["role"], string> = {
  owner: "Pwopriyetè",
  employee: "Anplwaye",
  platform_admin: "Admin platfòm",
};

const DATE_FORMAT = new Intl.DateTimeFormat("fr-HT", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function greeting(hour: number) {
  if (hour < 12) return "Bonjou";
  if (hour < 18) return "Bon apremidi";
  return "Bonswa";
}

function initials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function DashboardHeader({
  profile,
  storeName,
}: {
  profile: Profile;
  storeName: string;
}) {
  const router = useRouter();
  const firstName = profile.full_name.split(" ")[0];
  const today = new Date();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-foreground">
          {greeting(today.getHours())}, {firstName}
        </h1>
        <p className="text-sm text-text-secondary">
          {storeName} · {DATE_FORMAT.format(today)}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <SyncStatusBadge />

        <DropdownMenu>
          <DropdownMenuTrigger className="flex min-h-12 items-center gap-2 rounded-md border border-border bg-surface px-2 pr-3 text-left hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                {initials(profile.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-medium text-foreground">{profile.full_name}</span>
              <span className="text-xs text-text-secondary">{ROLE_LABELS[profile.role]}</span>
            </div>
            <ChevronDown className="size-4 shrink-0 text-text-secondary" aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>{profile.full_name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/settings" />}>
                <Settings data-icon="inline-start" aria-hidden />
                Paramèt
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                <LogOut data-icon="inline-start" aria-hidden />
                Dekonekte
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
