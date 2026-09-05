import Image from "next/image";
import { cn } from "@/lib/utils";

const ILLUSTRATIONS = {
  generic: "/illustrations/empty-generic.png",
  credit: "/illustrations/empty-credit.png",
  support: "/illustrations/empty-support.png",
  network: "/illustrations/empty-network.png",
} as const;

export type EmptyStateIllustration = keyof typeof ILLUSTRATIONS;

/**
 * Standard empty/error-state block: illustration + title + optional
 * description/action. Replaces the old ad-hoc "flat-color-icon + text"
 * pattern repeated across every list page.
 */
export function EmptyState({
  illustration = "generic",
  title,
  description,
  action,
  compact = false,
  className,
}: {
  illustration?: EmptyStateIllustration;
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** Smaller image/padding/text for inline card bodies (vs. a full page empty state). */
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-lg border border-dashed border-border text-center",
        compact ? "gap-2 py-10" : "gap-3 py-16",
        className,
      )}
    >
      <Image
        src={ILLUSTRATIONS[illustration]}
        alt=""
        width={160}
        height={160}
        className={compact ? "h-16 w-auto" : "h-28 w-auto"}
      />
      {compact ? (
        <p className="text-sm text-text-secondary">{title}</p>
      ) : (
        <div className="flex flex-col gap-1">
          <p className="font-medium text-foreground">{title}</p>
          {description && <p className="text-sm text-text-secondary">{description}</p>}
        </div>
      )}
      {action}
    </div>
  );
}
