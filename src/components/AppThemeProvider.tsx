"use client";

import { usePathname } from "next/navigation";
import { ThemeProvider } from "next-themes";

/**
 * Single app-wide `next-themes` provider (mounted once at the root
 * layout — nesting a second `<ThemeProvider>` deeper in the tree is a
 * no-op in this library once one is already mounted, and mounting one
 * only inside `(dashboard)`/`(admin)` with none at the root would leave
 * a stale `.dark` class on `<html>` after navigating away, since
 * unmounting never resets the class it applied).
 *
 * The landing page and every unauthenticated auth screen stay always
 * light — no signed-in preference to honor yet, and brand consistency
 * for an anonymous visitor matters more than a system preference here.
 * `forcedTheme` re-applies on every pathname change because this is
 * the same provider instance the whole time, just re-rendered with a
 * different prop.
 */
const ALWAYS_LIGHT_PREFIXES = ["/login", "/register", "/accept-invite", "/onboarding"];

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const forced = pathname === "/" || ALWAYS_LIGHT_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ? "light" : undefined;

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem forcedTheme={forced}>
      {children}
    </ThemeProvider>
  );
}
