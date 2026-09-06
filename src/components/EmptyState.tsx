"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { DURATION } from "@/lib/motion";
import { cn } from "@/lib/utils";

const ILLUSTRATIONS = {
  generic: "/illustrations/empty-generic.jpg",
  credit: "/illustrations/empty-credit.jpg",
  support: "/illustrations/empty-support.jpg",
  network: "/illustrations/empty-network.jpg",
  products: "/illustrations/empty-products.jpg",
  sales: "/illustrations/empty-sales.jpg",
  team: "/illustrations/empty-team.jpg",
  search: "/illustrations/empty-search.jpg",
} as const;

export type EmptyStateIllustration = keyof typeof ILLUSTRATIONS;

/**
 * Standard empty/error-state block: illustration + title + optional
 * description/action. Replaces the old ad-hoc "flat-color-icon + text"
 * pattern repeated across every list page.
 */
export function EmptyState({
  illustration = "generic",
  title,
  description,
  action,
  compact = false,
  className,
}: {
  illustration?: EmptyStateIllustration;
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** Smaller image/padding/text for inline card bodies (vs. a full page empty state). */
  compact?: boolean;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: DURATION.base }}
      className={cn(
        "flex flex-col items-center rounded-lg border border-dashed border-border text-center",
        compact ? "gap-2 py-10" : "gap-3 py-16",
        className,
      )}
    >
      <Image
        src={ILLUSTRATIONS[illustration]}
        alt=""
        width={160}
        height={160}
        className={compact ? "h-16 w-auto" : "h-28 w-auto"}
      />
      {compact ? (
        <p className="text-sm text-text-secondary">{title}</p>
      ) : (
        <div className="flex flex-col gap-1">
          <p className="font-medium text-foreground">{title}</p>
          {description && <p className="text-sm text-text-secondary">{description}</p>}
        </div>
      )}
      {action}
    </motion.div>
  );
}
