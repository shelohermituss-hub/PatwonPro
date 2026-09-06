"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * A circle + checkmark that draws itself in — the one real "reward" moment
 * in the merchant app (a completed sale), instead of a plain dialog title.
 */
export function SuccessCheck({ className }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <svg viewBox="0 0 52 52" className={className} aria-hidden>
      <motion.circle
        cx="26"
        cy="26"
        r="24"
        fill="none"
        stroke="var(--success)"
        strokeWidth="3"
        initial={shouldReduceMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
      <motion.path
        d="M15 27l7 7 15-15"
        fill="none"
        stroke="var(--success)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={shouldReduceMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, ease: "easeOut", delay: shouldReduceMotion ? 0 : 0.35 }}
      />
    </svg>
  );
}
