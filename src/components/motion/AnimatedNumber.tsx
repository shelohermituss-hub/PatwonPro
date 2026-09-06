"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { DURATION, EASE } from "@/lib/motion";

/**
 * Count-up number display. Animates from the previously rendered value
 * to the new one whenever `value` changes, re-formatting on every frame
 * with `format` — this is why callers pass the raw number instead of a
 * pre-formatted string (`formatCurrencyHTG`/`formatCurrency` slot in
 * directly as `format`).
 *
 * `whenInView` gates the very first animation behind scroll visibility
 * (landing page stats, below the fold) instead of counting up the
 * moment the component mounts (dashboard/report KPI cards, which are
 * visible immediately).
 */
export function AnimatedNumber({
  value,
  format = (n) => String(Math.round(n)),
  whenInView = false,
  className,
}: {
  value: number;
  format?: (n: number) => string;
  whenInView?: boolean;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const shouldAnimate = whenInView ? isInView : true;
  const [display, setDisplay] = useState(0);
  const previousRef = useRef(0);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (!shouldAnimate) return;
    const from = hasAnimatedRef.current ? previousRef.current : 0;

    const controls = animate(from, value, {
      duration: shouldReduceMotion ? 0 : DURATION.slow * 2,
      ease: EASE,
      onUpdate: setDisplay,
    });
    previousRef.current = value;
    hasAnimatedRef.current = true;
    return () => controls.stop();
  }, [value, shouldAnimate, shouldReduceMotion]);

  return (
    <span ref={ref} className={className}>
      {format(shouldAnimate ? display : 0)}
    </span>
  );
}
