"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";
import { updateThemePreference } from "@/lib/theme/updateThemePreference";
import type { ThemePreference } from "@/types";

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Klè", icon: Sun },
  { value: "dark", label: "Fonse", icon: Moon },
  { value: "system", label: "Sistèm", icon: Monitor },
];

function subscribeNoop() {
  return () => {};
}

/**
 * `next-themes` only knows the real theme after mount (it reads
 * `localStorage` client-side) — rendering the group before that would
 * flash the wrong option selected on every load. Same
 * server-false/client-true snapshot trick as `useIsMobile`
 * (`src/hooks/use-mobile.ts`), instead of a `useEffect` + `setState`
 * that the lint rule against setState-in-effect flags.
 */
function useMounted() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return <div className="h-10 w-56 animate-pulse rounded-lg bg-muted" aria-hidden />;
  }

  return (
    <div
      role="radiogroup"
      aria-label="Tèm aparans"
      className="inline-flex rounded-lg border border-border bg-muted p-1"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => {
              haptics.select();
              setTheme(value);
              void updateThemePreference(value);
            }}
            className={cn(
              "flex min-h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors",
              active ? "bg-card text-foreground shadow-sm" : "text-text-secondary hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}
