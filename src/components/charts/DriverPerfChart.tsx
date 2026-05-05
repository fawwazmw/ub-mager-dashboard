"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { DriverPerformance } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

interface DriverPerfChartProps {
  data: DriverPerformance[];
  metric?: "total_revenue" | "total_trips" | "rating";
  height?: number;
}

export function DriverPerfChart({ data, metric = "total_revenue", height = 200 }: DriverPerfChartProps) {
  if (data.length === 0) return null;

  const labels: Record<string, string> = {
    total_revenue: "Revenue",
    total_trips: "Trips",
    rating: "Rating",
  };

  const chartData = data.slice(0, 10).map((d) => ({
    name: d.full_name.split(" ")[0],
    value: d[metric],
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <XAxis
          type="number"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "hsl(225, 15%, 50%)", fontSize: 10 }}
          tickFormatter={(val) =>
            metric === "total_revenue" ? `${(val / 1000).toFixed(0)}k` : String(val)
          }
        />
        <YAxis
          type="category"
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "hsl(225, 15%, 50%)", fontSize: 11 }}
          width={60}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(225, 40%, 11%)",
            border: "1px solid hsl(225, 28%, 16%)",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value: number) => {
            if (metric === "total_revenue") return [formatCurrency(value), labels[metric]];
            return [value, labels[metric]];
          }}
        />
        <Bar dataKey="value" fill="hsl(42, 65%, 55%)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
