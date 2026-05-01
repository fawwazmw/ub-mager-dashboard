"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DollarSign, TrendingUp, Route, BarChart3 } from "lucide-react";
import { clsx } from "clsx";
import {
  AreaChart, Area, BarChart, Bar,
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
}

interface DailyRevenue {
  date: string;
  revenue: number;
  rides: number;
}

export default function AnalyticsPage() {
  const [revenue, setRevenue] = useState<RevenueStats | null>(null);
  const [rideStats, setRideStats] = useState<RideStats | null>(null);
  const [dailyData, setDailyData] = useState<DailyRevenue[]>([]);
  const [period, setPeriod] = useState("month");
  const [chartDays, setChartDays] = useState(14);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [revRes, rideRes, dailyRes] = await Promise.all([
        api.getRevenueStats(period),
        api.getRideStats(period),
        api.getDailyRevenue(chartDays),
      ]);
      if (revRes.success) setRevenue(revRes.data);
      if (rideRes.success) setRideStats(rideRes.data);
      if (dailyRes.success) setDailyData(dailyRes.data || []);
      setLoading(false);
    }
    fetchData();
  }, [period, chartDays]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Revenue and ride performance</p>
        </div>
        <div className="flex gap-2">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
          ))}
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
              <p className="text-xs text-muted-foreground mt-1 capitalize">{period}</p>
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
              <p className="text-xs text-muted-foreground mt-1">per ride</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Total Rides</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center border text-primary bg-primary/10 border-primary/20">
                  <Route size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold tabular-nums">{revenue?.total_rides || 0}</p>
              <p className="text-xs text-muted-foreground mt-1 capitalize">{period}</p>
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
                      <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 11 }}
                    tickFormatter={(val) => new Date(val).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 11 }}
                    tickFormatter={(val) => val > 0 ? `${(val / 1000).toFixed(0)}k` : "0"}
                    width={45}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222, 47%, 8%)",
                      border: "1px solid hsl(217, 33%, 17%)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    labelFormatter={(val) => new Date(val).toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long" })}
                    formatter={(value: number) => [`Rp ${value.toLocaleString("id-ID")}`, "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(142, 76%, 36%)" strokeWidth={2} fill="url(#revGrad)" />
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
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 11 }}
                    tickFormatter={(val) => new Date(val).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 11 }}
                    width={30}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222, 47%, 8%)",
                      border: "1px solid hsl(217, 33%, 17%)",
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

          {/* Ride Performance Stats */}
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
          </div>
        </>
      )}
    </div>
  );
}
