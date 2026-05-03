"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DollarSign, TrendingUp, Route, BarChart3, Download, Clock, Car } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { clsx } from "clsx";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

interface RevenueStats {
  period: string;
  total_revenue: number;
  total_rides: number;
  avg_fare: number;
  currency: string;
}

interface RideStats {
  period: string;
  total: number;
  completed: number;
  cancelled: number;
  completion_rate: number;
  avg_distance_km: number;
  avg_duration_min: number;
  by_vehicle_type: { vehicle_type: string; count: number }[];
}

interface DailyRevenue {
  date: string;
  revenue: number;
  rides: number;
}

export default function AnalyticsPage() {
  usePageTitle("Analytics");
  const [revenue, setRevenue] = useState<RevenueStats | null>(null);
  const [prevRevenue, setPrevRevenue] = useState<RevenueStats | null>(null);
  const [rideStats, setRideStats] = useState<RideStats | null>(null);
  const [dailyData, setDailyData] = useState<DailyRevenue[]>([]);
  const [peakHours, setPeakHours] = useState<{ hour: number; count: number }[]>([]);
  const [period, setPeriod] = useState("month");
  const [chartDays, setChartDays] = useState(14);
  const [loading, setLoading] = useState(true);

  const prevPeriodMap: Record<string, string> = { today: "week", week: "month", month: "month" };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [revRes, prevRevRes, rideRes, dailyRes, peakRes] = await Promise.all([
        api.getRevenueStats(period),
        api.getRevenueStats(prevPeriodMap[period] || "month"),
        api.getRideStats(period),
        api.getDailyRevenue(chartDays),
        api.getPeakHours(chartDays),
      ]);
      if (revRes.success) setRevenue(revRes.data);
      if (prevRevRes.success) setPrevRevenue(prevRevRes.data);
      if (rideRes.success) setRideStats(rideRes.data);
      if (dailyRes.success) setDailyData(dailyRes.data || []);
      if (peakRes.success) setPeakHours(peakRes.data || []);
      setLoading(false);
    }
    fetchData();
  }, [period, chartDays]);

  function pctChange(current: number, previous: number): { value: string; positive: boolean } | null {
    if (previous === 0) return null;
    const pct = ((current - previous) / previous) * 100;
    return { value: `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`, positive: pct >= 0 };
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Revenue and ride performance</p>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => {
              if (dailyData.length === 0) return;
              const headers = ["Date", "Revenue", "Rides"];
              const rows = dailyData.map((d) => [d.date, d.revenue, d.rides]);
              const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `analytics-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            disabled={dailyData.length === 0}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-30"
          >
            <Download size={12} />
            CSV
          </button>
          {["today", "week", "month"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={clsx(
                "px-3 py-1.5 text-xs rounded-lg border transition-colors capitalize",
                period === p
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-5">
                <div className="skeleton h-3 w-20 mb-3" />
                <div className="skeleton h-7 w-28 mb-1" />
                <div className="skeleton h-3 w-16" />
              </div>
            ))}
          </div>
          <div className="skeleton h-64 w-full rounded-xl" />
        </div>
      ) : (
        <>
          {/* Revenue Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Total Revenue</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center border text-primary bg-primary/10 border-primary/20">
                  <DollarSign size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold tabular-nums">
                Rp {(revenue?.total_revenue || 0).toLocaleString("id-ID")}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground capitalize">{period}</span>
                {(() => {
                  const change = pctChange(revenue?.total_revenue || 0, prevRevenue?.total_revenue || 0);
                  if (!change) return null;
                  return <span className={clsx("text-[10px] font-medium", change.positive ? "text-green-400" : "text-destructive")}>{change.value}</span>;
                })()}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Avg Fare</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center border text-blue-400 bg-blue-400/10 border-blue-400/20">
                  <TrendingUp size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold tabular-nums">
                Rp {(revenue?.avg_fare || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 })}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">per ride</span>
                {(() => {
                  const change = pctChange(revenue?.avg_fare || 0, prevRevenue?.avg_fare || 0);
                  if (!change) return null;
                  return <span className={clsx("text-[10px] font-medium", change.positive ? "text-green-400" : "text-destructive")}>{change.value}</span>;
                })()}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Total Rides</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center border text-primary bg-primary/10 border-primary/20">
                  <Route size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold tabular-nums">{revenue?.total_rides || 0}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground capitalize">{period}</span>
                {(() => {
                  const change = pctChange(revenue?.total_rides || 0, prevRevenue?.total_rides || 0);
                  if (!change) return null;
                  return <span className={clsx("text-[10px] font-medium", change.positive ? "text-green-400" : "text-destructive")}>{change.value}</span>;
                })()}
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-primary" />
                <h2 className="text-sm font-medium">Revenue Trend</h2>
              </div>
              <div className="flex gap-1">
                {[7, 14, 30].map((d) => (
                  <button
                    key={d}
                    onClick={() => setChartDays(d)}
                    className={clsx(
                      "px-2 py-1 text-xs rounded transition-colors",
                      chartDays === d ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(42, 65%, 55%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(42, 65%, 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 28%, 16%)" />
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
                    tickFormatter={(val) => val > 0 ? `${(val / 1000).toFixed(0)}k` : "0"}
                    width={45}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(225, 40%, 11%)",
                      border: "1px solid hsl(225, 28%, 16%)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    labelFormatter={(val) => new Date(val).toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long" })}
                    formatter={(value: number) => [`Rp ${value.toLocaleString("id-ID")}`, "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(42, 65%, 55%)" strokeWidth={2} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Rides Per Day Bar Chart */}
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={16} className="text-blue-400" />
              <h2 className="text-sm font-medium">Rides Per Day</h2>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 28%, 16%)" />
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
                    width={30}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(225, 40%, 11%)",
                      border: "1px solid hsl(225, 28%, 16%)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    labelFormatter={(val) => new Date(val).toLocaleDateString("id-ID", { weekday: "short", day: "2-digit", month: "short" })}
                    formatter={(value: number) => [value, "Rides"]}
                  />
                  <Bar dataKey="rides" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {peakHours.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={16} className="text-primary" />
                <h2 className="text-sm font-medium">Peak Hours</h2>
                <span className="text-[10px] text-muted-foreground ml-auto">Last {chartDays} days</span>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={peakHours} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                    <XAxis
                      dataKey="hour"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(225, 15%, 50%)", fontSize: 10 }}
                      tickFormatter={(h) => `${h}:00`}
                      interval={2}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(225, 40%, 11%)",
                        border: "1px solid hsl(225, 28%, 16%)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      labelFormatter={(h) => `${h}:00 - ${h}:59`}
                      formatter={(value: number) => [value, "Rides"]}
                    />
                    <Bar
                      dataKey="count"
                      radius={[3, 3, 0, 0]}
                      fill="hsl(42, 65%, 55%)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
                <span>Busiest: {peakHours.reduce((max, h) => h.count > max.count ? h : max, peakHours[0])?.hour}:00</span>
                <span>Quietest: {peakHours.reduce((min, h) => h.count < min.count ? h : min, peakHours[0])?.hour}:00</span>
              </div>
            </div>
          )}

          {(rideStats?.by_vehicle_type || []).length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Car size={16} className="text-blue-400" />
                <h2 className="text-sm font-medium">Vehicle Distribution</h2>
              </div>
              <div className="flex items-center gap-8">
                <div className="w-36 h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={rideStats!.by_vehicle_type}
                        dataKey="count"
                        nameKey="vehicle_type"
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={60}
                        strokeWidth={2}
                        stroke="hsl(225, 35%, 11%)"
                      >
                        {rideStats!.by_vehicle_type.map((_, i) => (
                          <Cell key={i} fill={["hsl(42, 65%, 55%)", "hsl(217, 91%, 60%)", "hsl(280, 65%, 60%)"][i % 3]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {rideStats!.by_vehicle_type.map((vt, i) => {
                    const total = rideStats!.by_vehicle_type.reduce((s, v) => s + v.count, 0);
                    const pct = total > 0 ? ((vt.count / total) * 100).toFixed(0) : "0";
                    return (
                      <div key={vt.vehicle_type} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-sm" style={{ background: ["hsl(42, 65%, 55%)", "hsl(217, 91%, 60%)", "hsl(280, 65%, 60%)"][i % 3] }} />
                        <div>
                          <p className="text-xs font-medium capitalize">{vt.vehicle_type.toLowerCase().replace("_", " ")}</p>
                          <p className="text-[10px] text-muted-foreground tabular-nums">{vt.count} rides ({pct}%)</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-sm font-medium mb-4">Ride Performance</h2>
            <div className="grid grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total</p>
                <p className="text-xl font-bold tabular-nums">{rideStats?.total || 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Completed</p>
                <p className="text-xl font-bold tabular-nums text-green-400">{rideStats?.completed || 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Cancelled</p>
                <p className="text-xl font-bold tabular-nums text-destructive">{rideStats?.cancelled || 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Completion Rate</p>
                <p className="text-xl font-bold tabular-nums">{(rideStats?.completion_rate || 0).toFixed(1)}%</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-3 bg-muted rounded-full overflow-hidden flex">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${rideStats?.completion_rate || 0}%` }}
              />
              {(rideStats?.cancelled || 0) > 0 && (
                <div
                  className="h-full bg-destructive transition-all"
                  style={{ width: `${100 - (rideStats?.completion_rate || 0)}%` }}
                />
              )}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Completed</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> Cancelled</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Avg Distance</p>
                <p className="text-lg font-bold tabular-nums">{(rideStats?.avg_distance_km || 0).toFixed(1)} km</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Avg Duration</p>
                <p className="text-lg font-bold tabular-nums">{(rideStats?.avg_duration_min || 0).toFixed(0)} min</p>
              </div>
              {(rideStats?.by_vehicle_type || []).map((vt: any) => (
                <div key={vt.vehicle_type}>
                  <p className="text-xs text-muted-foreground mb-1 capitalize">{vt.vehicle_type}</p>
                  <p className="text-lg font-bold tabular-nums">{vt.count}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
