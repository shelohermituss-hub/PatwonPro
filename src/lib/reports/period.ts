export type ReportPeriod = "today" | "week" | "month" | "custom";
export type TrendBucket = "hour" | "day";

export interface PeriodRange {
  from: Date;
  to: Date;
  bucket: TrendBucket;
}

/**
 * Haiti (America/Port-au-Prince) never observes DST — a fixed UTC-5
 * offset is exact, not an approximation, so period boundaries ("today")
 * line up with the shop's actual calendar day without pulling in a full
 * IANA timezone library for a Server Component.
 */
const HAITI_OFFSET_MS = -5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function haitiDateParts(date: Date) {
  const shifted = new Date(date.getTime() + HAITI_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
    weekday: shifted.getUTCDay(),
  };
}

function haitiMidnightUtc(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month, day) - HAITI_OFFSET_MS);
}

/** Parses a `YYYY-MM-DD` (HTML date input) string as a Haiti calendar day. */
function parseHaitiDateInput(value: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]) - 1, day: Number(match[3]) };
}

export function resolvePeriodRange(
  period: ReportPeriod,
  customFrom?: string,
  customTo?: string,
): PeriodRange {
  const { year, month, day, weekday } = haitiDateParts(new Date());
  const todayStart = haitiMidnightUtc(year, month, day);
  const tomorrowStart = new Date(todayStart.getTime() + DAY_MS);

  if (period === "today") {
    return { from: todayStart, to: tomorrowStart, bucket: "hour" };
  }

  if (period === "week") {
    const daysSinceMonday = (weekday + 6) % 7;
    const from = new Date(todayStart.getTime() - daysSinceMonday * DAY_MS);
    return { from, to: tomorrowStart, bucket: "day" };
  }

  if (period === "month") {
    const from = haitiMidnightUtc(year, month, 1);
    return { from, to: tomorrowStart, bucket: "day" };
  }

  const fromParts = customFrom ? parseHaitiDateInput(customFrom) : null;
  const toParts = customTo ? parseHaitiDateInput(customTo) : null;
  const from = fromParts ? haitiMidnightUtc(fromParts.year, fromParts.month, fromParts.day) : todayStart;
  const toStart = toParts
    ? haitiMidnightUtc(toParts.year, toParts.month, toParts.day)
    : todayStart;
  const to = new Date(Math.max(toStart.getTime() + DAY_MS, from.getTime() + DAY_MS));

  return { from, to, bucket: "day" };
}
