import { Skeleton } from "@/components/ui/skeleton";

/**
 * Suspense fallback for the auth forms that read `useSearchParams()`
 * (login, accept-invite) — without this the boundary renders nothing,
 * which reads as a blank flash on first paint.
 */
export function AuthFormSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}
