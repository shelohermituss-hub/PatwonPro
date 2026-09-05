"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatCurrencyHTG } from "@/lib/format";
import { MRR_VS_COLLECTED_SERIES } from "@/lib/admin/mock/analytics";

export function MrrChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>MRR vs Lajan Antre</CardTitle>
        <CardDescription>Revni mansyèl atann kont sa ki reyèlman kolekte</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={MRR_VS_COLLECTED_SERIES} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="mrrFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="collectedFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--success)" stopOpacity={0.25} />
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
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area
              type="monotone"
              dataKey="mrr"
              name="MRR atann"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="url(#mrrFill)"
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
