"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { DailyRevenue } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

interface RevenueChartProps {
  data: DailyRevenue[];
  height?: number;
}

export function RevenueChart({ data, height = 200 }: RevenueChartProps) {
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revChartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(42, 65%, 55%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(42, 65%, 55%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "hsl(225, 15%, 50%)", fontSize: 11 }}
          tickFormatter={(val) => new Date(val).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "hsl(225, 15%, 50%)", fontSize: 11 }}
          tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
          width={45}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(225, 40%, 11%)",
            border: "1px solid hsl(225, 28%, 16%)",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          labelFormatter={(val) => new Date(val).toLocaleDateString("id-ID", { weekday: "short", day: "2-digit", month: "short" })}
          formatter={(value: number) => [formatCurrency(value), "Revenue"]}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="hsl(42, 65%, 55%)"
          strokeWidth={2}
          fill="url(#revChartGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
