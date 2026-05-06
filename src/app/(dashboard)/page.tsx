"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useRevenueStats, useDailyRevenue, useAdminRides } from "@/hooks/useAnalytics";
import { Users, Car, Route, DollarSign, Activity, XCircle, TrendingUp, Clock, MapPin, BarChart3, ArrowRight, AlertTriangle } from "lucide-react";
import { RIDE_STATUS_COLORS } from "@/lib/constants";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { clsx } from "clsx";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Sparkline } from "@/components/ui/Sparkline";
import { formatCurrency } from "@/lib/format";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { usePageTitle } from "@/hooks/usePageTitle";
import { QueryError } from "@/components/ui/QueryError";

function StatCard({ label, value, icon: Icon, color = "primary", subtitle, sparkData }: { label: string; value: string | number; icon: React.ElementType; color?: string; subtitle?: string; sparkData?: number[] }) {
  const colorMap: Record<string, string> = {
    primary: "text-primary bg-primary/10 border-primary/20",
    warning: "text-warning bg-warning/10 border-warning/20",
    destructive: "text-destructive bg-destructive/10 border-destructive/20",
    blue: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  };

  const sparkColors: Record<string, string> = {
    primary: "hsl(42, 65%, 55%)",
    warning: "hsl(38, 92%, 50%)",
    destructive: "hsl(0, 84%, 60%)",
    blue: "hsl(217, 91%, 60%)",
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-muted-foreground/20 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${colorMap[color]}`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold tabular-nums">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {sparkData && sparkData.length > 1 && (
          <Sparkline data={sparkData} color={sparkColors[color] || sparkColors.primary} height={28} width={64} />
        )}
      </div>
    </div>
  );
}



export default function DashboardPage() {
  const router = useRouter();
  usePageTitle("Dashboard");

  const { data: stats, dataUpdatedAt, isError, refetch } = useDashboardStats();
  const { data: revenue } = useRevenueStats("month");
  const { data: dailyRevenue = [] } = useDailyRevenue(7);
  const { data: ridesResult } = useAdminRides(1, 5, "", "");
  const recentRides = ridesResult?.data ?? [];

  const loading = !stats && !isError;

  if (isError) {
    return <QueryError message="Failed to connect to API server" onRetry={() => refetch()} />;
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="skeleton h-64 w-full" />
      </div>
    );
  }

  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Platform overview and real-time metrics</p>
        </div>
        {lastUpdated && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {lastUpdated.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        )}
      </div>

      {(stats.pending_drivers || 0) > 0 && (
        <Link
          href="/drivers?status=pending"
          className="flex items-center gap-3 bg-warning/5 border border-warning/20 rounded-xl px-4 py-3 mb-4 hover:bg-warning/10 transition-colors group"
        >
          <AlertTriangle size={16} className="text-warning shrink-0" />
          <p className="text-sm flex-1">
            <span className="font-medium text-warning">{stats.pending_drivers}</span>
            <span className="text-muted-foreground"> driver{stats.pending_drivers > 1 ? "s" : ""} pending verification</span>
          </p>
          <ArrowRight size={14} className="text-muted-foreground group-hover:text-warning transition-colors" />
        </Link>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-page-in">
        <StatCard label="Online Drivers" value={stats.online_drivers} icon={Activity} color="primary" subtitle={`of ${stats.total_drivers} total`} />
        <StatCard label="Active Rides" value={stats.active_rides} icon={Route} color="warning" subtitle="in progress now" />
        <StatCard label="Completed Today" value={stats.completed_today} icon={Route} color="primary" subtitle="rides finished" sparkData={dailyRevenue.map(d => d.rides)} />
        <StatCard label="Revenue Today" value={formatCurrency(stats.revenue_today)} icon={DollarSign} color="primary" sparkData={dailyRevenue.map(d => d.revenue)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Users" value={stats.total_users} icon={Users} color="blue" />
        <StatCard label="Total Drivers" value={stats.total_drivers} icon={Car} color="blue" />
        <StatCard label="Total Rides" value={stats.total_rides} icon={Route} color="blue" subtitle="all time" />
        <StatCard label="Cancelled Today" value={stats.cancelled_today} icon={XCircle} color="destructive" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Link href="/live-tracking" className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors group">
          <MapPin size={18} className="text-primary" />
          <span className="text-sm flex-1">Live Map</span>
          <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>
        <Link href="/drivers?status=pending" className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors group">
          <Car size={18} className="text-warning" />
          <span className="text-sm flex-1">Pending Drivers</span>
          <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>
        <Link href="/rides?status=IN_PROGRESS" className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors group">
          <Route size={18} className="text-blue-400" />
          <span className="text-sm flex-1">Active Rides</span>
          <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>
        <Link href="/analytics/revenue" className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors group">
          <BarChart3 size={18} className="text-primary" />
          <span className="text-sm flex-1">Analytics</span>
          <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>
      </div>

      {dailyRevenue.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium">Revenue (Last 7 Days)</h2>
            <TrendingUp size={16} className="text-muted-foreground" />
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyRevenue} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium">Monthly Summary</h2>
            <TrendingUp size={16} className="text-muted-foreground" />
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Revenue (this month)</p>
              <p className="text-xl font-bold tabular-nums">{formatCurrency(revenue?.total_revenue || 0)}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Rides</p>
                <p className="text-lg font-bold tabular-nums">{revenue?.total_rides || 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Avg Fare</p>
                <p className="text-lg font-bold tabular-nums">{formatCurrency(revenue?.avg_fare || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-medium">Recent Rides</h2>
            <Clock size={16} className="text-muted-foreground" />
          </div>
          {recentRides.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No rides yet</div>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {recentRides.map((ride) => (
                  <tr key={ride.id} onClick={() => router.push(`/rides/${ride.id}`)} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                    <td className="px-5 py-3">
                      <p className="font-medium truncate max-w-[180px]">{ride.pickup_address}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">→ {ride.dropoff_address}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className={clsx("text-xs px-2 py-0.5 rounded", RIDE_STATUS_COLORS[ride.status] || "text-muted-foreground")}>
                        {ride.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-muted-foreground text-xs">
                      {formatCurrency(ride.total_fare)}
                    </td>
                    <td className="px-5 py-3 text-right text-muted-foreground text-xs">
                      <TimeAgo date={ride.requested_at} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
