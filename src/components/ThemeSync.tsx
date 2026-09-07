"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import type { ThemePreference } from "@/types";

/**
 * Applies the profile's saved theme preference the first time a device
 * has no local choice yet (fresh browser/PWA install) — so signing in
 * on a new device picks up the account's preference instead of always
 * defaulting to "system". Never overrides a preference already chosen
 * on this device (that's `next-themes`'s `localStorage` copy, the
 * per-device source of truth once it exists).
 */
export function ThemeSync({ profileThemePreference }: { profileThemePreference: ThemePreference }) {
  const { setTheme } = useTheme();

  useEffect(() => {
    try {
      if (window.localStorage.getItem("theme")) return;
    } catch {
      return;
    }
    setTheme(profileThemePreference);
    // Only ever meant to run once, on mount, before any local choice exists.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
