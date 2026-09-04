import type { Profile } from "@/types";

export function isOwner(profile: Profile | null): boolean {
  return profile?.role === "owner";
}

export function isPlatformAdmin(profile: Profile | null): boolean {
  return profile?.role === "platform_admin";
}
