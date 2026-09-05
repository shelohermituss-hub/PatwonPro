import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/lib/admin/labels";

const TONE_CLASS: Record<StatusTone, string> = {
  positive: "border-transparent bg-success/10 text-success",
  warning: "border-transparent bg-warning/10 text-warning",
  negative: "border-transparent bg-danger/10 text-danger",
  info: "border-transparent bg-primary/10 text-primary",
  neutral: "border-transparent bg-muted text-muted-foreground",
};

/** Generic status pill for the admin back-office — never color-only, always carries text. */
export function StatusBadge({
  label,
  tone,
  className,
}: {
  label: string;
  tone: StatusTone;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn(TONE_CLASS[tone], className)}>
      {label}
    </Badge>
  );
}
