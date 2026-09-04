import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface KpiTrend {
  tone: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  label: string;
}

const TONE_CLASSES: Record<KpiTrend["tone"], string> = {
  positive: "bg-success/10 text-success",
  negative: "bg-danger/10 text-danger",
  neutral: "bg-warning/10 text-warning",
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
  icon: Icon,
  trend,
  detail,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  trend: KpiTrend;
  detail: string;
}) {
  const TrendIcon = trend.icon;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <span className="text-sm font-medium text-text-secondary">{label}</span>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="size-5" aria-hidden />
          </div>
        </div>

        <p className="text-3xl font-extrabold tracking-tight text-foreground">{value}</p>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              TONE_CLASSES[trend.tone],
            )}
          >
            <TrendIcon className="size-3.5" aria-hidden />
            {trend.label}
          </span>
          <span className="text-xs text-text-secondary">{detail}</span>
        </div>
      </CardContent>
    </Card>
  );
}
