"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { PeakHourItem } from "@/lib/types";

interface PeakHoursChartProps {
  data: PeakHourItem[];
  height?: number;
}

export function PeakHoursChart({ data, height = 200 }: PeakHoursChartProps) {
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="hour"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "hsl(225, 15%, 50%)", fontSize: 10 }}
          tickFormatter={(h) => `${h}:00`}
          interval={2}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "hsl(225, 15%, 50%)", fontSize: 10 }}
          width={30}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(225, 40%, 11%)",
            border: "1px solid hsl(225, 28%, 16%)",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          labelFormatter={(h) => `${h}:00 – ${h}:59`}
          formatter={(value: number) => [value, "Rides"]}
        />
        <Bar dataKey="count" fill="hsl(42, 65%, 55%)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
