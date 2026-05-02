"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Search, Download } from "lucide-react";
import { CopyButton } from "@/components/ui/CopyButton";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { clsx } from "clsx";

interface Ride {
  id: string;
  passenger_name: string;
  passenger_phone: string;
  driver_name: string | null;
  status: string;
  vehicle_type: string;
  pickup_address: string;
  dropoff_address: string;
  estimated_distance_m: number;
  estimated_duration_s: number;
  total_fare: number;
  requested_at: string;
  completed_at: string | null;
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

const statusOptions = ["", "SEARCHING", "MATCHED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export default function RidesPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const router = useRouter();

  useEffect(() => {
    async function fetchCounts() {
      const res = await api.getRideCountsByStatus();
      if (res.success && res.data) {
        const map: Record<string, number> = {};
        res.data.forEach((item: any) => { map[item.status] = item.count; });
        setStatusCounts(map);
      }
    }
    fetchCounts();
  }, []);

  const fetchRides = useCallback(async () => {
    setLoading(true);
    const res = await api.getAdminRides(page, 15, statusFilter, search);
    if (res.success) {
      setRides(res.data || []);
      if (res.meta) {
        setTotalPages(res.meta.total_pages);
        setTotal(res.meta.total);
      }
    }
    setLoading(false);
  }, [page, statusFilter, search]);

  useEffect(() => { fetchRides(); }, [fetchRides]);

  // Reset page when filter/search changes
  useEffect(() => { setPage(1); }, [statusFilter, search]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
  }

  function exportCSV() {
    if (rides.length === 0) return;
    const headers = ["ID", "Passenger", "Driver", "Status", "Pickup", "Dropoff", "Fare", "Date"];
    const rows = rides.map((r) => [
      r.id,
      r.passenger_name,
      r.driver_name || "Unassigned",
      r.status,
      `"${r.pickup_address}"`,
      `"${r.dropoff_address}"`,
      r.total_fare,
      new Date(r.requested_at).toISOString(),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rides-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Rides</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {total} total rides
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Export */}
          <button
            onClick={exportCSV}
            disabled={rides.length === 0}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-30"
          >
            <Download size={12} />
            CSV
          </button>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search passenger, address..."
              className="bg-muted border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs w-56 focus:outline-none focus:border-primary transition-colors"
            />
          </form>

          {/* Status filter */}
          <div className="flex gap-1.5 flex-wrap">
            {statusOptions.map((s) => {
              const count = s ? statusCounts[s] || 0 : Object.values(statusCounts).reduce((a, b) => a + b, 0);
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={clsx(
                    "px-2.5 py-1.5 text-xs rounded-lg border transition-colors flex items-center gap-1.5",
                    statusFilter === s
                      ? "bg-primary/10 border-primary/20 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s || "All"}
                  {count > 0 && (
                    <span className="text-[10px] tabular-nums opacity-60">{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3 w-8">#</th>
              <th className="text-left px-4 py-3">Route</th>
              <th className="text-left px-4 py-3">Passenger</th>
              <th className="text-left px-4 py-3">Driver</th>
              <th className="text-center px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Fare</th>
              <th className="text-right px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td colSpan={7} className="px-4 py-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                </tr>
              ))
            ) : rides.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No rides found</td></tr>
            ) : (
              rides.map((ride) => (
                <tr key={ride.id} onClick={() => router.push(`/rides/${ride.id}`)} className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <CopyButton text={ride.id} />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium truncate max-w-[180px]">{ride.pickup_address}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[180px]">→ {ride.dropoff_address}</p>
                    {ride.estimated_distance_m > 0 && (
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded tabular-nums">
                          {(ride.estimated_distance_m / 1000).toFixed(1)} km
                        </span>
                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded tabular-nums">
                          {Math.round(ride.estimated_duration_s / 60)} min
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm">{ride.passenger_name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{ride.passenger_phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    {ride.driver_name ? (
                      <p className="text-sm">{ride.driver_name}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Unassigned</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={clsx("text-xs px-2 py-0.5 rounded", statusColors[ride.status] || "text-muted-foreground")}>
                      {ride.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    Rp {ride.total_fare.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                    <TimeAgo date={ride.requested_at} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              ← Previous
            </button>
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages} ({total} rides)
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
