"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DollarSign, TrendingUp, Route } from "lucide-react";
import { clsx } from "clsx";

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

export default function AnalyticsPage() {
  const [revenue, setRevenue] = useState<RevenueStats | null>(null);
  const [rideStats, setRideStats] = useState<RideStats | null>(null);
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [revRes, rideRes] = await Promise.all([
        api.getRevenueStats(period),
        api.getRideStats(period),
      ]);
      if (revRes.success) setRevenue(revRes.data);
      if (rideRes.success) setRideStats(rideRes.data);
      setLoading(false);
    }
    fetchData();
  }, [period]);

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
              <p className="text-xs text-muted-foreground mt-1">{period}</p>
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
              <p className="text-xs text-muted-foreground mt-1">{period}</p>
            </div>
          </div>

          {/* Ride Stats */}
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

            {/* Simple progress bar */}
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${rideStats?.completion_rate || 0}%` }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
