"use client";

import { motion, useReducedMotion } from "motion/react";
import { DURATION, EASE } from "@/lib/motion";

/**
 * Page-enter transition, meant to be the only thing rendered by a route
 * group's `template.tsx` — `template.tsx` remounts on every navigation
 * (unlike `layout.tsx`), so this fires on every page change without any
 * exit-animation bookkeeping (no `AnimatePresence` needed).
 */
export function PageFade({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.slow, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
