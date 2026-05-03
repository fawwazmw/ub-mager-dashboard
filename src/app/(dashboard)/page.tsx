"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Users, Car, Route, DollarSign, Activity, XCircle, TrendingUp, Clock, MapPin, BarChart3, ArrowRight, Pause, Play, AlertTriangle } from "lucide-react";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { clsx } from "clsx";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Sparkline } from "@/components/ui/Sparkline";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { usePageTitle } from "@/hooks/usePageTitle";

interface Stats {
  total_users: number;
  total_drivers: number;
  online_drivers: number;
  pending_drivers: number;
  total_rides: number;
  active_rides: number;
  completed_today: number;
  revenue_today: number;
  cancelled_today: number;
}

interface RevenueStats {
  period: string;
  total_revenue: number;
  total_rides: number;
  avg_fare: number;
}

interface Ride {
  id: string;
  status: string;
  passenger_name: string;
  pickup_address: string;
  dropoff_address: string;
  total_fare: number;
  vehicle_type: string;
  requested_at: string;
}

interface DailyRevenue {
  date: string;
  revenue: number;
  rides: number;
}

function StatCard({ label, value, icon: Icon, color = "primary", subtitle, sparkData }: { label: string; value: string | number; icon: any; color?: string; subtitle?: string; sparkData?: number[] }) {
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

const statusColors: Record<string, string> = {
  SEARCHING: "text-yellow-400 bg-yellow-400/10",
  MATCHED: "text-blue-400 bg-blue-400/10",
  DRIVER_EN_ROUTE: "text-blue-400 bg-blue-400/10",
  ARRIVED_AT_PICKUP: "text-purple-400 bg-purple-400/10",
  IN_PROGRESS: "text-primary bg-primary/10",
  COMPLETED: "text-amber-400 bg-amber-400/10",
  CANCELLED: "text-destructive bg-destructive/10",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [revenue, setRevenue] = useState<RevenueStats | null>(null);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [recentRides, setRecentRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const router = useRouter();

  async function fetchAll() {
    const [statsRes, revenueRes, dailyRes, ridesRes] = await Promise.all([
      api.getDashboardStats(),
      api.getRevenueStats("month"),
      api.getDailyRevenue(7),
      api.getAdminRides(1, 5),
    ]);
    if (statsRes.success) setStats(statsRes.data);
    if (revenueRes.success) setRevenue(revenueRes.data);
    if (dailyRes.success) setDailyRevenue(dailyRes.data || []);
    if (ridesRes.success) setRecentRides(ridesRes.data || []);
    setLoading(false);
    setLastUpdated(new Date());
  }

  usePageTitle("Dashboard");

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Platform overview and real-time metrics</p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground tabular-nums">
              {lastUpdated.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={clsx(
              "p-1.5 rounded-lg border transition-colors",
              autoRefresh
                ? "border-primary/20 text-primary bg-primary/10"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
            title={autoRefresh ? "Pause auto-refresh" : "Resume auto-refresh"}
          >
            {autoRefresh ? <Pause size={12} /> : <Play size={12} />}
          </button>
          <button
            onClick={fetchAll}
            className="text-xs text-muted-foreground hover:text-primary border border-border px-2.5 py-1.5 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {(stats?.pending_drivers || 0) > 0 && (
        <Link
          href="/drivers?status=pending"
          className="flex items-center gap-3 bg-warning/5 border border-warning/20 rounded-xl px-4 py-3 mb-4 hover:bg-warning/10 transition-colors group"
        >
          <AlertTriangle size={16} className="text-warning shrink-0" />
          <p className="text-sm flex-1">
            <span className="font-medium text-warning">{stats?.pending_drivers}</span>
            <span className="text-muted-foreground"> driver{(stats?.pending_drivers || 0) > 1 ? "s" : ""} pending verification</span>
          </p>
          <ArrowRight size={14} className="text-muted-foreground group-hover:text-warning transition-colors" />
        </Link>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-page-in">
        <StatCard label="Online Drivers" value={stats?.online_drivers || 0} icon={Activity} color="primary" subtitle={`of ${stats?.total_drivers || 0} total`} />
        <StatCard label="Active Rides" value={stats?.active_rides || 0} icon={Route} color="warning" subtitle="in progress now" />
        <StatCard label="Completed Today" value={stats?.completed_today || 0} icon={Route} color="primary" subtitle="rides finished" sparkData={dailyRevenue.map(d => d.rides)} />
        <StatCard label="Revenue Today" value={`Rp ${(stats?.revenue_today || 0).toLocaleString("id-ID")}`} icon={DollarSign} color="primary" sparkData={dailyRevenue.map(d => d.revenue)} />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Users" value={stats?.total_users || 0} icon={Users} color="blue" />
        <StatCard label="Total Drivers" value={stats?.total_drivers || 0} icon={Car} color="blue" />
        <StatCard label="Total Rides" value={stats?.total_rides || 0} icon={Route} color="blue" subtitle="all time" />
        <StatCard label="Cancelled Today" value={stats?.cancelled_today || 0} icon={XCircle} color="destructive" />
      </div>

      {/* Quick Actions */}
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

      {/* Revenue Chart */}
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
                  formatter={(value: number) => [`Rp ${value.toLocaleString("id-ID")}`, "Revenue"]}
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

      {/* Bottom Section: Revenue Summary + Recent Rides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Revenue Card */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium">Monthly Summary</h2>
            <TrendingUp size={16} className="text-muted-foreground" />
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Revenue (this month)</p>
              <p className="text-xl font-bold tabular-nums">Rp {(revenue?.total_revenue || 0).toLocaleString("id-ID")}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Rides</p>
                <p className="text-lg font-bold tabular-nums">{revenue?.total_rides || 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Avg Fare</p>
                <p className="text-lg font-bold tabular-nums">Rp {(revenue?.avg_fare || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Rides */}
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
                      <span className={clsx("text-xs px-2 py-0.5 rounded", statusColors[ride.status] || "text-muted-foreground")}>
                        {ride.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-muted-foreground text-xs">
                      Rp {ride.total_fare.toLocaleString("id-ID")}
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


