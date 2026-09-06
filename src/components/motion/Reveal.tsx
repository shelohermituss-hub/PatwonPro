"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { fadeUp, staggerContainer } from "@/lib/motion";

/**
 * Scroll-triggered entrance for a single block — landing sections that
 * appear below the fold. Fires once (`viewport={{ once: true }}`), so
 * scrolling back up never replays it.
 */
export function Reveal({
  children,
  className,
  variants = fadeUp,
}: {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

/**
 * Same idea, but for a group of siblings (a card grid) that should
 * appear in sequence rather than all at once — children should be
 * `motion.div`/`motion.li` elements using the `staggerItem` variant.
 */
export function RevealGroup({
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
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  );
}
