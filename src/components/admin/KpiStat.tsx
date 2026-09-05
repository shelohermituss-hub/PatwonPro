import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/lib/admin/labels";

const TONE_TEXT: Record<StatusTone, string> = {
  positive: "text-success",
  warning: "text-warning",
  negative: "text-danger",
  info: "text-primary",
  neutral: "text-foreground",
};

/** Clickable KPI tile for the admin dashboard — each one deep-links to its filtered list. */
export function KpiStat({
  label,
  value,
  href,
  tone = "neutral",
  detail,
}: {
  label: string;
  value: string;
  href: string;
  tone?: StatusTone;
  detail?: string;
}) {
  return (
    <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-xl">
      <Card className="h-full transition-colors hover:border-primary/40">
        <CardContent className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-text-secondary">{label}</span>
          <span className={cn("text-2xl font-extrabold tracking-tight", TONE_TEXT[tone])}>{value}</span>
          {detail && <span className="text-xs text-text-secondary">{detail}</span>}
        </CardContent>
      </Card>
    </Link>
  );
}
