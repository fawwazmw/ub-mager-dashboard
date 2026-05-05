"use client";

import { useState } from "react";
import { useDriverLeaderboard } from "@/hooks/useAnalytics";
import { downloadCSV } from "@/lib/csv";
import type { DriverPerformance } from "@/lib/types";
import { Trophy, Star, Route, DollarSign, Download } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { clsx } from "clsx";
import { formatCurrency } from "@/lib/format";

type SortBy = "revenue" | "trips" | "rating";

export default function DriverLeaderboardPage() {
  usePageTitle("Leaderboard");
  const [sortBy, setSortBy] = useState<SortBy>("revenue");

  const { data: drivers = [], isLoading: loading } = useDriverLeaderboard(20);

  const sorted = [...drivers].sort((a, b) => {
    if (sortBy === "trips") return b.total_trips - a.total_trips;
    if (sortBy === "rating") return b.rating - a.rating;
    return b.total_revenue - a.total_revenue;
  });

  function exportCSV() {
    downloadCSV(
      ["Rank", "Name", "Phone", "Vehicle", "Plate", "Rating", "Trips", "Revenue", "Avg Fare"],
      sorted.map((d, i) => [
        i + 1, d.full_name, d.phone, d.vehicle_type, d.license_plate,
        d.rating.toFixed(1), d.total_trips, d.total_revenue, d.avg_fare.toFixed(0),
      ]),
      `driver-leaderboard-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  }

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-yellow-400" />
            <h1 className="text-2xl font-bold">Driver Leaderboard</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">Top performing drivers by {sortBy}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            disabled={drivers.length === 0}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-30"
          >
            <Download size={12} />
            CSV
          </button>
          {(["revenue", "trips", "rating"] as SortBy[]).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={clsx(
                "px-2.5 py-1.5 text-xs rounded-lg border transition-colors capitalize",
                sortBy === s
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              <div className="skeleton h-6 w-8" />
              <div className="skeleton h-10 w-10 rounded-full" />
              <div className="flex-1">
                <div className="skeleton h-4 w-32 mb-1" />
                <div className="skeleton h-3 w-24" />
              </div>
              <div className="skeleton h-5 w-20" />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No driver data yet</div>
      ) : (
        <div className="space-y-3">
          {sorted.map((driver, index) => (
            <div
              key={driver.id}
              className={clsx(
                "bg-card border rounded-xl p-4 flex items-center gap-4 transition-colors hover:border-muted-foreground/30",
                index < 3 ? "border-yellow-400/20" : "border-border"
              )}
            >
              <div className="w-10 text-center">
                {index < 3 ? (
                  <span className="text-xl">{medals[index]}</span>
                ) : (
                  <span className="text-sm text-muted-foreground font-bold tabular-nums">#{index + 1}</span>
                )}
              </div>

              <div className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                index === 0 ? "bg-yellow-400/20 text-yellow-400" :
                index === 1 ? "bg-gray-300/20 text-gray-300" :
                index === 2 ? "bg-orange-400/20 text-orange-400" :
                "bg-muted text-muted-foreground"
              )}>
                {driver.full_name.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{driver.full_name}</p>
                <p className="text-xs text-muted-foreground">
                  {driver.vehicle_type} • {driver.license_plate}
                </p>
              </div>

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

              <div className="text-right">
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className={clsx(
                  "font-bold tabular-nums",
                  index === 0 ? "text-yellow-400" : "text-foreground"
                )}>
                  {formatCurrency(driver.total_revenue)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
