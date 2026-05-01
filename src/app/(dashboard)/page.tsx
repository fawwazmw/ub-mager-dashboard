"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Users, Car, Route, DollarSign, Activity, XCircle, TrendingUp, Clock } from "lucide-react";
import { clsx } from "clsx";

interface Stats {
  total_users: number;
  total_drivers: number;
  online_drivers: number;
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
  pickup_address: string;
  dropoff_address: string;
  total_fare: number;
  vehicle_type: string;
  requested_at: string;
}

function StatCard({ label, value, icon: Icon, color = "primary", subtitle }: { label: string; value: string | number; icon: any; color?: string; subtitle?: string }) {
  const colorMap: Record<string, string> = {
    primary: "text-primary bg-primary/10 border-primary/20",
    warning: "text-warning bg-warning/10 border-warning/20",
    destructive: "text-destructive bg-destructive/10 border-destructive/20",
    blue: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-muted-foreground/20 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${colorMap[color]}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}

const statusColors: Record<string, string> = {
  SEARCHING: "text-yellow-400 bg-yellow-400/10",
  MATCHED: "text-blue-400 bg-blue-400/10",
  DRIVER_EN_ROUTE: "text-blue-400 bg-blue-400/10",
  ARRIVED_AT_PICKUP: "text-purple-400 bg-purple-400/10",
  IN_PROGRESS: "text-primary bg-primary/10",
  COMPLETED: "text-green-400 bg-green-400/10",
  CANCELLED: "text-destructive bg-destructive/10",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [revenue, setRevenue] = useState<RevenueStats | null>(null);
  const [recentRides, setRecentRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      const [statsRes, revenueRes, ridesRes] = await Promise.all([
        api.getDashboardStats(),
        api.getRevenueStats("month"),
        api.getRideHistory(1, 5),
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (revenueRes.success) setRevenue(revenueRes.data);
      if (ridesRes.success) setRecentRides(ridesRes.data || []);
      setLoading(false);
    }
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-muted rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform overview and real-time metrics</p>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Online Drivers" value={stats?.online_drivers || 0} icon={Activity} color="primary" subtitle={`of ${stats?.total_drivers || 0} total`} />
        <StatCard label="Active Rides" value={stats?.active_rides || 0} icon={Route} color="warning" subtitle="in progress now" />
        <StatCard label="Completed Today" value={stats?.completed_today || 0} icon={Route} color="primary" subtitle="rides finished" />
        <StatCard label="Revenue Today" value={`Rp ${(stats?.revenue_today || 0).toLocaleString("id-ID")}`} icon={DollarSign} color="primary" />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Users" value={stats?.total_users || 0} icon={Users} color="blue" />
        <StatCard label="Total Drivers" value={stats?.total_drivers || 0} icon={Car} color="blue" />
        <StatCard label="Total Rides" value={stats?.total_rides || 0} icon={Route} color="blue" subtitle="all time" />
        <StatCard label="Cancelled Today" value={stats?.cancelled_today || 0} icon={XCircle} color="destructive" />
      </div>

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
                  <tr key={ride.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
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
                      {timeAgo(ride.requested_at)}
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

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}
