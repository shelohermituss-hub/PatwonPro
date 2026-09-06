"use client";

import { motion, useReducedMotion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";
import { DURATION } from "@/lib/motion";

/**
 * Shared loading placeholder for `/products/[id]/edit`, `/sales/[id]` and
 * `/credits/[id]` — same shape duplicated 3x before this, now one place to
 * keep in sync (and one place to animate the mount).
 */
export function DetailSkeleton({ variant = "detail" }: { variant?: "detail" | "form" }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="flex flex-col gap-6 p-6"
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: DURATION.base }}
    >
      <Skeleton className="h-8 w-64" />
      {variant === "form" ? (
        <div className="flex max-w-2xl flex-col gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <Skeleton className="h-40 w-full" />
      )}
    </motion.div>
  );
}
