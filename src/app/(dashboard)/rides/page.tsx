"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { clsx } from "clsx";

interface Ride {
  id: string;
  status: string;
  vehicle_type: string;
  pickup_address: string;
  dropoff_address: string;
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
  COMPLETED: "text-green-400 bg-green-400/10",
  CANCELLED: "text-destructive bg-destructive/10",
};

export default function RidesPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchRides() {
      setLoading(true);
      const res = await api.getRideHistory(page, 15);
      if (res.success) {
        setRides(res.data || []);
        if (res.meta) setTotalPages(res.meta.total_pages);
      }
      setLoading(false);
    }
    fetchRides();
  }, [page]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Rides</h1>
        <p className="text-muted-foreground text-sm mt-1">All ride history</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3">Route</th>
              <th className="text-left px-4 py-3">Vehicle</th>
              <th className="text-center px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Fare</th>
              <th className="text-right px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td colSpan={5} className="px-4 py-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                </tr>
              ))
            ) : rides.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No rides found</td></tr>
            ) : (
              rides.map((ride) => (
                <tr key={ride.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium truncate max-w-[200px]">{ride.pickup_address}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">&rarr; {ride.dropoff_address}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{ride.vehicle_type}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={clsx("text-xs px-2 py-1 rounded-md", statusColors[ride.status] || "text-muted-foreground")}>
                      {ride.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    Rp {ride.total_fare.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                    {new Date(ride.requested_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
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
              className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              &larr; Previous
            </button>
            <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              Next &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
