"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { STORE_GROWTH_SERIES } from "@/lib/admin/mock/analytics";

export function StoreGrowthChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kwasans Boutik</CardTitle>
        <CardDescription>Boutik aktif sou 6 dènye mwa</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={STORE_GROWTH_SERIES} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="storeGrowthFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
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
              width={40}
              tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
            />
            <Tooltip contentStyle={{ borderRadius: 12, borderColor: "var(--border)" }} />
            <Area
              type="monotone"
              dataKey="stores"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="url(#storeGrowthFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
