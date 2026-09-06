"use client";

import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { formatCurrencyHTG } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface KpiTrend {
  tone: "positive" | "negative" | "neutral";
  /** A rendered `<Icons.x className="size-3.5" aria-hidden />` element, not
   * the bare component — `KpiCard`'s callers are Server Components, and a
   * component *reference* can't cross the Server→Client boundary the same
   * way a `format` function can't (see below); a rendered element can. */
  icon: ReactNode;
  label: string;
}

// `text-*` here only colors `trend.label` — the glassmorphism icons render
// with their own fixed SVG fills (not `currentColor`), so it has no effect
// on `TrendIcon` itself.
const TONE_CLASSES: Record<KpiTrend["tone"], string> = {
  positive: "bg-success/10 text-success",
  negative: "bg-danger/10 text-danger",
  neutral: "bg-warning/10 text-warning",
};

/**
 * `format` is a string key, not a function — `KpiCard` is rendered from
 * `(dashboard)/dashboard/page.tsx`, a Server Component, and a function
 * prop can't cross the Server→Client boundary (only serializable values
 * can). The actual formatter is resolved here, entirely client-side.
 */
const FORMATTERS: Record<"currency" | "count", (n: number) => string> = {
  currency: formatCurrencyHTG,
  count: (n) => String(n),
};

/**
 * Premium KPI card: icon, headline value, a trend chip, and a secondary
 * detail line. The trend is never a fabricated number — callers pass a
 * real day-over-day % where a comparable baseline exists (sales, profit)
 * or a qualitative status where it doesn't (stock, credit — the app has
 * no historical snapshot to compare against).
 */
export function KpiCard({
  label,
  value,
  format = "count",
  icon,
  trend,
  detail,
}: {
  label: string;
  /** Raw numeric value — animated as a count-up and re-formatted every frame via `format`. */
  value: number;
  format?: "currency" | "count";
  /** A rendered `<Icons.x className="size-6" aria-hidden />` element — see `KpiTrend.icon`. */
  icon: ReactNode;
  trend: KpiTrend;
  detail: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <span className="text-sm font-medium text-text-secondary">{label}</span>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
            {icon}
          </div>
        </div>

        <p className="text-3xl font-extrabold tracking-tight text-foreground">
          <AnimatedNumber value={value} format={FORMATTERS[format]} />
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              TONE_CLASSES[trend.tone],
            )}
          >
            {trend.icon}
            {trend.label}
          </span>
          <span className="text-xs text-text-secondary">{detail}</span>
        </div>
      </CardContent>
    </Card>
  );
}
