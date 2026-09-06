"use client";

import { motion, useReducedMotion } from "motion/react";
import { staggerContainer, staggerItem } from "@/lib/motion";

/**
 * Mount-time (not scroll-triggered) stagger — for above-the-fold grids
 * like the dashboard KPI row, visible the instant the page renders.
 * Use `Reveal`/`RevealGroup` instead for anything below the fold.
 */
export function StaggerGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} initial="hidden" animate="visible" variants={staggerContainer}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  );
}
