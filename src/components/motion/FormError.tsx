"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * Shared `formError` display for the auth forms (login/register/accept-invite/
 * onboarding) — fades in with a brief horizontal shake instead of a hard cut,
 * so a rejected submission reads as a reaction rather than a silent swap.
 */
export function FormError({ message }: { message: string | null }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {message && (
        <motion.p
          key={message}
          role="alert"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1, x: shouldReduceMotion ? 0 : [0, -4, 4, -4, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="text-sm font-medium text-danger"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
