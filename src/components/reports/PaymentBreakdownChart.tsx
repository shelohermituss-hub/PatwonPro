"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { PAYMENT_METHOD_LABELS } from "@/lib/pos/labels";
import type { PaymentBreakdownRow } from "@/lib/reports/queries";
import type { PaymentMethod } from "@/types";

// Raw, non-token colors — acceptable here per docs/DESIGN_SYSTEM.md's
// explicit carve-out for Recharts categorical breakdowns.
const COLORS: Record<PaymentMethod, string> = {
  cash: "var(--primary)",
  moncash: "var(--warning)",
  natcash: "var(--success)",
  credit: "#7c3aed",
};

export function PaymentBreakdownChart({ data }: { data: PaymentBreakdownRow[] }) {
  const total = data.reduce((sum, row) => sum + row.total, 0);
  const chartData = data.map((row) => ({
    name: PAYMENT_METHOD_LABELS[row.payment_method],
    value: row.total,
    color: COLORS[row.payment_method],
    percent: total > 0 ? Math.round((row.total / total) * 100) : 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Repatisyon Peman</CardTitle>
        <CardDescription>Pa mwayen peman sou peryòd la</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-sm text-text-secondary">
            Pa gen vant sou peryòd sa a.
          </p>
        ) : (
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <ResponsiveContainer width="100%" height={200} className="sm:max-w-[200px]">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
            <ul className="flex flex-1 flex-col gap-2">
              {chartData.map((entry) => (
                <li key={entry.name} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: entry.color }}
                      aria-hidden
                    />
                    {entry.name}
                  </span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(entry.value)} ({entry.percent}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
