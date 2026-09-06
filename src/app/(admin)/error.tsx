"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Catches an uncaught exception thrown by any `/admin/*` page (e.g. a
 * bad query) without tearing down the whole AdminShell — the sidebar/
 * header from `(admin)/layout.tsx` stay mounted since they didn't throw,
 * only this page's content area is replaced. Without this, any admin
 * page crash fell through to the root `src/app/error.tsx`, discarding
 * the entire admin chrome for a single broken page.
 */
export default function AdminRouteError({
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
    <div className="flex flex-col items-center justify-center gap-4 p-16 text-center">
      <TriangleAlert className="size-12 text-danger" aria-hidden />
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-foreground">Paj sa a pa t ka chaje</h1>
        <p className="max-w-sm text-sm text-text-secondary">
          Gen yon erè ki fèt pandan n ap chaje seksyon sa a. Eseye ankò — si
          pwoblèm nan kontinye, verifye jounal sèvè a.
        </p>
      </div>
      <Button onClick={reset} className="min-h-12">
        Eseye ankò
      </Button>
    </div>
  );
}
