import type { Transition, Variants } from "motion/react";

/**
 * Shared animation tokens — kept in one place so every page reads the same
 * "premium but restrained" motion language instead of each file picking
 * its own timing. Mirrors the `motion-safe:` discipline already used for
 * the auth hero's hand-written `@keyframes`: every consumer of these
 * variants is expected to pair them with `useReducedMotion()` where the
 * animation is more than a plain opacity fade.
 */
export const EASE = [0.16, 1, 0.3, 1] as const;

export const DURATION = {
  fast: 0.15,
  base: 0.25,
  slow: 0.4,
} as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASE },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE },
  },
};

export const springTransition: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 24,
};
