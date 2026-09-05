"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatCurrencyHTG } from "@/lib/format";
import type { CollectedPoint } from "@/lib/admin/queries/analytics";

/**
 * Real platform revenue collected per month (from `platform_transactions`).
 * The mock version charted a fabricated historical "MRR" line alongside
 * this — dropped, since MRR is a point-in-time figure (sum of active
 * subscriptions right now) with no snapshot history to reconstruct a
 * trend from; the current MRR figure lives on the dashboard KPI instead.
 */
export function MrrChart({ data }: { data: CollectedPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lajan Antre pa Mwa</CardTitle>
        <CardDescription>Revni Jere Boutik reyèlman kolekte (abònman)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="collectedFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--success)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--success)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={64}
              tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
              tickFormatter={(value: number) => formatCurrencyHTG(value)}
            />
            <Tooltip
              formatter={(value) => formatCurrencyHTG(Number(value))}
              contentStyle={{ borderRadius: 12, borderColor: "var(--border)" }}
            />
            <Area
              type="monotone"
              dataKey="collected"
              name="Kolekte"
              stroke="var(--success)"
              strokeWidth={2}
              fill="url(#collectedFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
