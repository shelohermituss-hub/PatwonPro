"use client";

import { useEffect } from "react";
import { Icons } from "@/lib/icons";
import { Button } from "@/components/ui/button";

/**
 * Catches any otherwise-uncaught exception thrown under the root layout
 * (every route group — `(dashboard)`, `(auth)`, `(admin)`) and shows a
 * Creole, actionable fallback instead of Next.js's generic English error
 * screen. Placed at this level (not inside a route group) because an
 * error thrown by a route group's own `layout.tsx` is only caught by an
 * `error.tsx` in a *parent* segment, never one in the same segment.
 */
export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <Icons.alert className="size-12" aria-hidden />
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-foreground">Gen yon pwoblèm ki rive</h1>
        <p className="max-w-sm text-sm text-text-secondary">
          Nou pa t ka chaje paj sa a. Eseye ankò — si pwoblèm nan kontinye,
          kontakte sipò.
        </p>
      </div>
      <Button onClick={reset} className="min-h-12">
        Eseye ankò
      </Button>
    </div>
  );
}
