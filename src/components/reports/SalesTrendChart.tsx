"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { TrendPoint } from "@/lib/reports/queries";
import type { TrendBucket } from "@/lib/reports/period";

const HOUR_FORMAT = new Intl.DateTimeFormat("fr-HT", { hour: "numeric" });
const DAY_FORMAT = new Intl.DateTimeFormat("fr-HT", { day: "numeric", month: "short" });

function formatBucketLabel(iso: string, bucket: TrendBucket) {
  const date = new Date(iso);
  return bucket === "hour" ? HOUR_FORMAT.format(date) : DAY_FORMAT.format(date);
}

export function SalesTrendChart({
  trend,
  bucket,
}: {
  trend: TrendPoint[];
  bucket: TrendBucket;
}) {
  const data = trend.map((point) => ({
    label: formatBucketLabel(point.bucket_start, bucket),
    total: point.total,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tandans Vant</CardTitle>
        <CardDescription>
          Total vant pa {bucket === "hour" ? "è" : "jou"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-text-secondary">
            Pa gen vant sou peryòd sa a.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="salesTrendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={56}
                tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
                tickFormatter={(value: number) => formatCurrency(value)}
              />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{ borderRadius: 12, borderColor: "var(--border)" }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="var(--primary)"
                strokeWidth={2}
                fill="url(#salesTrendFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
