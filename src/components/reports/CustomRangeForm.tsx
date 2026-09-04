import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * A plain GET form — no client JS needed, submitting just navigates to
 * `/reports?period=custom&from=...&to=...`, which the Server Component
 * page re-renders from.
 */
export function CustomRangeForm({ from, to }: { from?: string; to?: string }) {
  return (
    <form method="get" className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="period" value="custom" />
      <div className="flex flex-col gap-1">
        <label htmlFor="from" className="text-xs font-medium text-text-secondary">
          Depi
        </label>
        <Input id="from" name="from" type="date" defaultValue={from} className="min-h-11" />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="to" className="text-xs font-medium text-text-secondary">
          Jiska
        </label>
        <Input id="to" name="to" type="date" defaultValue={to} className="min-h-11" />
      </div>
      <Button type="submit" className="min-h-11">
        Aplike
      </Button>
    </form>
  );
}
