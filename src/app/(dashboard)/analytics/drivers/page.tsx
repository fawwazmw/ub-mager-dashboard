"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Trophy, Star, Route, DollarSign } from "lucide-react";
import { clsx } from "clsx";

interface DriverPerf {
  id: string;
  full_name: string;
  phone: string;
  vehicle_type: string;
  license_plate: string;
  rating: number;
  total_trips: number;
  total_revenue: number;
  avg_fare: number;
}

export default function DriverLeaderboardPage() {
  const [drivers, setDrivers] = useState<DriverPerf[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const res = await api.getDriverLeaderboard(20);
      if (res.success && res.data) setDrivers(res.data);
      setLoading(false);
    }
    fetch();
  }, []);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Trophy size={20} className="text-yellow-400" />
          <h1 className="text-2xl font-bold">Driver Leaderboard</h1>
        </div>
        <p className="text-muted-foreground text-sm mt-1">Top performing drivers by revenue</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : drivers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No driver data yet</div>
      ) : (
        <div className="space-y-3">
          {drivers.map((driver, index) => (
            <div
              key={driver.id}
              className={clsx(
                "bg-card border rounded-xl p-4 flex items-center gap-4 transition-colors hover:border-muted-foreground/30",
                index < 3 ? "border-yellow-400/20" : "border-border"
              )}
            >
              {/* Rank */}
              <div className="w-10 text-center">
                {index < 3 ? (
                  <span className="text-xl">{medals[index]}</span>
                ) : (
                  <span className="text-sm text-muted-foreground font-bold tabular-nums">#{index + 1}</span>
                )}
              </div>

              {/* Avatar */}
              <div className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                index === 0 ? "bg-yellow-400/20 text-yellow-400" :
                index === 1 ? "bg-gray-300/20 text-gray-300" :
                index === 2 ? "bg-orange-400/20 text-orange-400" :
                "bg-muted text-muted-foreground"
              )}>
                {driver.full_name.charAt(0)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{driver.full_name}</p>
                <p className="text-xs text-muted-foreground">
                  {driver.vehicle_type} • {driver.license_plate}
                </p>
              </div>

              {/* Stats */}
              <div className="hidden sm:flex items-center gap-6">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star size={10} /> Rating
                  </div>
                  <p className="text-sm font-bold tabular-nums">{driver.rating.toFixed(1)}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Route size={10} /> Trips
                  </div>
                  <p className="text-sm font-bold tabular-nums">{driver.total_trips}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <DollarSign size={10} /> Avg
                  </div>
                  <p className="text-sm font-bold tabular-nums">
                    {driver.avg_fare > 0 ? `${(driver.avg_fare / 1000).toFixed(0)}k` : "-"}
                  </p>
                </div>
              </div>

              {/* Revenue */}
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className={clsx(
                  "font-bold tabular-nums",
                  index === 0 ? "text-yellow-400" : "text-foreground"
                )}>
                  Rp {driver.total_revenue.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
