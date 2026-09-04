import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ReportPeriod } from "@/lib/reports/period";

const TABS: { value: ReportPeriod; label: string }[] = [
  { value: "today", label: "Jodi a" },
  { value: "week", label: "Semèn sa a" },
  { value: "month", label: "Mwa sa a" },
  { value: "custom", label: "Pèsonalize" },
];

export function PeriodTabs({ active }: { active: ReportPeriod }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map(({ value, label }) => (
        <Link
          key={value}
          href={`/reports?period=${value}`}
          className={cn(
            "flex min-h-11 items-center rounded-lg border px-4 text-sm font-medium transition-colors",
            active === value
              ? "border-transparent bg-primary text-primary-foreground"
              : "border-border bg-background text-text-secondary hover:bg-muted hover:text-foreground",
          )}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
